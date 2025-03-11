from PIL import Image, ImageDraw
import os

# Get the absolute path for the test images directory
script_dir = os.path.dirname(os.path.abspath(__file__))
test_images_dir = os.path.join(script_dir, 'test_images')

# Create test images directory with full permissions
os.makedirs(test_images_dir, mode=0o777, exist_ok=True)

def create_face_image(size=(300, 300), smile_width=2):
    # Create a new image with skin-tone background
    image = Image.new('RGB', size, (255, 220, 177))  # Light skin tone
    draw = ImageDraw.Draw(image)
    
    # Draw face outline (oval) with gradient-like shading
    for i in range(10):
        shade = 255 - i * 5
        draw.ellipse([50-i, 30-i, 250+i, 270+i], 
                    fill=(shade, int(shade*0.8), int(shade*0.7)),
                    outline=(139, 69, 19), width=1)
    
    # Draw eyes with more realistic detail
    # Left eye
    # - Eye socket shading
    draw.ellipse([90, 90, 150, 130], fill=(200, 170, 140))
    # - Eyeball
    draw.ellipse([100, 100, 140, 120], fill='white', outline=(100, 100, 100), width=2)
    # - Iris
    draw.ellipse([110, 102, 130, 118], fill=(50, 100, 200), outline='black', width=1)
    # - Pupil
    draw.ellipse([115, 105, 125, 115], fill='black')
    # - Highlight
    draw.ellipse([118, 107, 122, 111], fill='white')
    
    # Right eye (mirror of left)
    # - Eye socket shading
    draw.ellipse([150, 90, 210, 130], fill=(200, 170, 140))
    # - Eyeball
    draw.ellipse([160, 100, 200, 120], fill='white', outline=(100, 100, 100), width=2)
    # - Iris
    draw.ellipse([170, 102, 190, 118], fill=(50, 100, 200), outline='black', width=1)
    # - Pupil
    draw.ellipse([175, 105, 185, 115], fill='black')
    # - Highlight
    draw.ellipse([178, 107, 182, 111], fill='white')
    
    # Draw eyebrows with more detail
    for i in range(3):
        y_offset = i * 2
        draw.line([95-i, 90+y_offset, 145+i, 95+y_offset], fill='black', width=2)
        draw.line([155-i, 95+y_offset, 205+i, 90+y_offset], fill='black', width=2)
    
    # Draw nose with shading
    # - Bridge
    draw.polygon([(145, 130), (155, 130), (150, 160)], fill=(200, 170, 140))
    # - Nostrils
    draw.ellipse([140, 155, 150, 165], fill=(139, 69, 19))
    draw.ellipse([150, 155, 160, 165], fill=(139, 69, 19))
    
    # Draw lips with gradient
    # - Upper lip
    for i in range(smile_width):
        draw.arc([110, 140+i, 190, 190+i], 0, 180, fill=(200-i*20, 100-i*10, 100-i*10), width=1)
    # - Lower lip
    for i in range(smile_width):
        draw.arc([110, 160+i, 190, 210+i], 180, 360, fill=(220-i*20, 120-i*10, 120-i*10), width=1)
    
    return image

# Create and save profile image
profile_img = create_face_image(smile_width=2)
profile_path = os.path.join(test_images_dir, 'test_profile.jpg')
profile_img.save(profile_path, quality=95)
os.chmod(profile_path, 0o666)

# Create and save verification image (slightly different smile)
verify_img = create_face_image(smile_width=3)
verify_path = os.path.join(test_images_dir, 'test_verify.jpg')
verify_img.save(verify_path, quality=95)
os.chmod(verify_path, 0o666)

print(f'Test images created successfully in {test_images_dir}!')
