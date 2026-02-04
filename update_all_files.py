import re

files_to_update = [
    {
        'path': r'c:\Users\Haryan\source\repos\Lativectors\src\pages\UserDetails.tsx',
        'import_line': 'import { useParams, useNavigate } from "react-router-dom";',
        'new_import': 'import { useParams, useNavigate } from "react-router-dom";\nimport UserStatusIndicator from "@/components/UserStatusIndicator";',
        'pattern': r'<div className=\{`absolute top-1 right-1.*?title=\{user\.is_online.*?\}>\s*</div>',
        'replacement': '<UserStatusIndicator is_active={user.is_active} is_verified={user.is_verified} is_online={user.is_online} size="lg" />'
    },
    {
        'path': r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Conversations.tsx',
        'import_line': 'import { useNavigate } from "react-router-dom";',
        'new_import': 'import { useNavigate } from "react-router-dom";\nimport UserStatusIndicator from "@/components/UserStatusIndicator";',
        'pattern': r'<Circle className="absolute -bottom-0\.5 -right-0\.5.*?/>',
        'replacement': '<UserStatusIndicator is_online={conv.is_online} className="absolute -bottom-0.5 -right-0.5" />'
    },
    {
        'path': r'c:\Users\Haryan\source\repos\Lativectors\src\pages\ChatRoom.tsx',
        'import_line': 'import { useAuth } from "@/contexts/AuthContext";',
        'new_import': 'import { useAuth } from "@/contexts/AuthContext";\nimport UserStatusIndicator from "@/components/UserStatusIndicator";',
        'pattern': None,  # Will handle manually
        'replacement': None
    },
    {
        'path': r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Dashboard.tsx',
        'import_line': 'import UsernameSettings from "@/components/UsernameSettings";',
        'new_import': 'import UsernameSettings from "@/components/UsernameSettings";\nimport UserStatusIndicator from "@/components/UserStatusIndicator";',
        'pattern': None,  # Will handle manually
        'replacement': None
    },
    {
        'path': r'c:\Users\Haryan\source\repos\Lativectors\src\components\UsernameSettings.tsx',
        'import_line': 'import { toast } from "sonner";',
        'new_import': 'import { toast } from "sonner";\nimport UserStatusIndicator from "@/components/UserStatusIndicator";',
        'pattern': None,  # Will handle manually
        'replacement': None
    }
]

for file_info in files_to_update:
    try:
        with open(file_info['path'], 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add import
        content = content.replace(file_info['import_line'], file_info['new_import'])
        
        # Replace pattern if exists
        if file_info['pattern']:
            content = re.sub(file_info['pattern'], file_info['replacement'], content, flags=re.DOTALL)
        
        with open(file_info['path'], 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated {file_info['path'].split('\\\\')[-1]}")
    except Exception as e:
        print(f"Error updating {file_info['path'].split('\\\\')[-1]}: {e}")

print("\nAll files updated!")
