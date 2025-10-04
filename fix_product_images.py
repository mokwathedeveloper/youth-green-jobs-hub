#!/usr/bin/env python3
"""
Script to fix product images by creating placeholder images and updating products
"""
import os
import sys
import django
from PIL import Image, ImageDraw, ImageFont
import io
from django.core.files.base import ContentFile

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

from products.models import Product, ProductCategory, SMEVendor

def create_placeholder_image(text, width=400, height=300, bg_color=(52, 152, 219), text_color=(255, 255, 255)):
    """Create a placeholder image with text"""
    # Create image
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Save to BytesIO
    img_io = io.BytesIO()
    img.save(img_io, format='JPEG', quality=85)
    img_io.seek(0)
    
    return img_io

def fix_product_images():
    """Add placeholder images to products that don't have them"""
    print("🖼️ Fixing Product Images...")
    
    products = Product.objects.all()
    updated_count = 0
    
    for product in products:
        if not product.featured_image:
            print(f"📸 Creating image for: {product.name}")
            
            # Create placeholder image
            img_io = create_placeholder_image(product.name[:20])  # Limit text length
            
            # Create filename
            filename = f"{product.slug or product.name.lower().replace(' ', '_')}.jpg"
            
            # Save image to product
            product.featured_image.save(
                filename,
                ContentFile(img_io.getvalue()),
                save=True
            )
            
            updated_count += 1
            print(f"✅ Added image: {filename}")
    
    print(f"\n📊 Updated {updated_count} products with images")

def fix_category_images():
    """Add placeholder images to categories that don't have them"""
    print("\n🏷️ Fixing Category Images...")
    
    categories = ProductCategory.objects.all()
    updated_count = 0
    
    category_colors = [
        (46, 204, 113),   # Green
        (52, 152, 219),   # Blue  
        (155, 89, 182),   # Purple
        (241, 196, 15),   # Yellow
        (230, 126, 34),   # Orange
    ]
    
    for i, category in enumerate(categories):
        if not category.image:
            print(f"📸 Creating image for category: {category.name}")
            
            # Use different color for each category
            color = category_colors[i % len(category_colors)]
            
            # Create placeholder image
            img_io = create_placeholder_image(category.name, bg_color=color)
            
            # Create filename
            filename = f"{category.slug or category.name.lower().replace(' ', '_')}.jpg"
            
            # Save image to category
            category.image.save(
                filename,
                ContentFile(img_io.getvalue()),
                save=True
            )
            
            updated_count += 1
            print(f"✅ Added category image: {filename}")
    
    print(f"\n📊 Updated {updated_count} categories with images")

def main():
    print("🎨 Youth Green Jobs Hub - Image Fix Script")
    print("=" * 50)
    
    try:
        # Check if PIL is available
        import PIL
        print("✅ PIL (Pillow) is available")
        
        # Fix product images
        fix_product_images()
        
        # Fix category images  
        fix_category_images()
        
        print("\n🎉 Image fix completed successfully!")
        print("\n📋 Next Steps:")
        print("1. Commit and push changes")
        print("2. Wait for deployment")
        print("3. Check frontend - images should now display")
        
    except ImportError:
        print("❌ PIL (Pillow) not installed")
        print("Installing Pillow...")
        os.system("pip install Pillow")
        print("✅ Pillow installed, please run the script again")

if __name__ == "__main__":
    main()
