import re

# UserDetails.tsx
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\UserDetails.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div className=\{`absolute top-1 right-1 w-5 h-5 rounded-full border-4 border-background.*?title=\{user\.is_online.*?\}>\s*</div>'
replacement = '<UserStatusIndicator is_active={user.is_active} is_verified={user.is_verified} is_online={user.is_online} size="lg" />'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\UserDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("UserDetails.tsx updated")

# Conversations.tsx - search results
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Conversations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add status indicator to search results (after profile picture div)
search_pattern = r'(\{u\.username\?\.\[0\] \|\| u\.name\[0\]\)\}\s*</div>)'
search_replacement = r'\1\n                                                <UserStatusIndicator is_online={u.is_online} />'
content = re.sub(search_pattern, search_replacement, content)

# Replace Circle component in conversation list
circle_pattern = r'<Circle className="absolute -bottom-0\.5 -right-0\.5.*?/>'
circle_replacement = '<UserStatusIndicator is_online={conv.is_online} className="absolute -bottom-0.5 -right-0.5" />'
content = re.sub(circle_pattern, circle_replacement, content)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Conversations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Conversations.tsx updated")

# ChatRoom.tsx - add to profile dialog
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\ChatRoom.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add after the profile picture div in the dialog
chat_pattern = r'(\{profileUser\.name\?\.\[0\]\}\s*</div>)'
chat_replacement = r'\1\n                                <UserStatusIndicator is_active={profileUser.is_disabled !== true} is_online={profileUser.is_online} size="lg" />'
content = re.sub(chat_pattern, chat_replacement, content)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\ChatRoom.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ChatRoom.tsx updated")

# Dashboard.tsx - add to sidebar profile
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add after the profile picture div in sidebar
dashboard_pattern = r'(<User className="w-6 h-6 text-primary" />\s*\)\s*\}\s*</div>)'
dashboard_replacement = r'\1\n                    <UserStatusIndicator is_online={user.is_online} />'
content = re.sub(dashboard_pattern, dashboard_replacement, content)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard.tsx updated")

# UsernameSettings.tsx - add to profile picture
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\components\UsernameSettings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add after the profile picture div
settings_pattern = r'(<User className="w-8 h-8 text-primary" />\s*</div>\s*\)\s*\}\s*</div>)'
settings_replacement = r'\1\n                    <UserStatusIndicator is_online={user?.is_online} />'
content = re.sub(settings_pattern, settings_replacement, content)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\components\UsernameSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("UsernameSettings.tsx updated")

print("\nAll files successfully updated!")
