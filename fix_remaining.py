import re

# Fix ChatRoom.tsx - add status indicator to profile dialog
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\ChatRoom.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the profile picture div in the dialog and add status indicator after it
pattern = r'(<div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/20 overflow-hidden shrink-0">.*?</div>)'
replacement = r'<div className="relative">\n                                \1\n                                <UserStatusIndicator is_active={profileUser.is_disabled !== true} is_online={profileUser.is_online} size="lg" />\n                                </div>'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\ChatRoom.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ChatRoom.tsx fixed")

# Fix Conversations.tsx - add status indicator to search results
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Conversations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add relative wrapper and status indicator to search results
search_pattern = r'(<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-primary/20 shrink-0">.*?</div>)'
search_replacement = r'<div className="relative">\n                                            \1\n                                            <UserStatusIndicator is_online={u.is_online} />\n                                            </div>'

# Only replace the first occurrence (in search results, not in conversation list which already has it)
lines = content.split('\n')
replaced = False
for i, line in enumerate(lines):
    if not replaced and 'w-10 h-10 rounded-full bg-primary/10' in line and 'relative' not in lines[i-1]:
        # Find the closing div
        j = i
        while j < len(lines) and '</div>' not in lines[j]:
            j += 1
        # Insert relative wrapper
        indent = ' ' * (len(lines[i]) - len(lines[i].lstrip()))
        lines.insert(i, indent + '<div className="relative">')
        lines.insert(j + 2, indent + '    <UserStatusIndicator is_online={u.is_online} />')
        lines.insert(j + 3, indent + '</div>')
        replaced = True
        break

content = '\n'.join(lines)

with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\Conversations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Conversations.tsx fixed")

print("\nAll fixes applied!")
