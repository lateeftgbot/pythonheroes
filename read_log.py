import os

path = r'c:\Users\Haryan\source\repos\Lativectors\debug_out_final.txt'
if os.path.exists(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    # Try all reasonable encodings
    for encoding in ['utf-16', 'utf-8', 'latin-1']:
        try:
            print(f"--- Decoded with {encoding} ---")
            print(content.decode(encoding))
            break
        except:
            continue
else:
    print("File not found")
