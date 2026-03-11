import socket
import dns.resolver

target = "vectors1.hzv73wg.mongodb.net"
shards = [
    "ac-vm2dqdr-shard-00-00.hzv73wg.mongodb.net",
    "ac-vm2dqdr-shard-00-01.hzv73wg.mongodb.net",
    "ac-vm2dqdr-shard-00-02.hzv73wg.mongodb.net"
]

print(f"Testing DNS for {target}...")
try:
    answers = dns.resolver.resolve(f"_mongodb._tcp.{target}", 'SRV')
    for rdata in answers:
        print(f"SRV Record: {rdata.target} port {rdata.port}")
except Exception as e:
    print(f"SRV Lookup failed: {e}")

print("\nTesting TCP connectivity to shards on 27017...")
for shard in shards:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(5)
    try:
        s.connect((shard, 27017))
        print(f"SUCCESS: Connected to {shard}:27017")
        s.close()
    except Exception as e:
        print(f"FAILED: {shard}:27017 - {e}")

print("\nTesting connectivity to google.com:443 (sanity check)...")
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(5)
try:
    s.connect(("google.com", 443))
    print("SUCCESS: Connected to google.com:443")
    s.close()
except Exception as e:
    print(f"FAILED: google.com:443 - {e}")
