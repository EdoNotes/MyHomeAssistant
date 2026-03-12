#!/bin/bash

echo -e "\e[32m=== FIXING HOMEWAY DOCKER SETUP ===\e[0m"
echo ""

# Use absolute path to avoid issues with sudo
cd /home/edo-notes/homeassistant/homeway || { echo "Directory not found"; exit 1; }

cat > docker-compose.yml <<EOF
services:
  homeway:
    container_name: homeway
    image: homewayio/homeway:latest
    ports:
      - "11027:11027"
    environment:
      - HOME_ASSISTANT_IP=localhost
      - HOME_ASSISTANT_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlNDY4NjUxZTU0ZjU0OTYyYWM0ZTk2MTQwYjg1OTZlMSIsImlhdCI6MTc1ODIyNDc5NiwiZXhwIjoyMDczNTg0Nzk2fQ.o-4aZtjLlmH7imC4k3T0ltaWP4kmXf4WTCDb8SZ29fI
    volumes:
      - ./data:/data
    restart: unless-stopped
    network_mode: host
EOF

echo -e "\e[33mCreating corrected docker-compose.yml...\e[0m"
echo -e "\e[32m✅ Fixed configuration created\e[0m"
echo ""

echo -e "\e[33mCleaning up any existing Homeway containers...\e[0m"
docker stop homeway 2>/dev/null || true
docker rm homeway 2>/dev/null || true

echo -e "\e[33mStarting Homeway with fixed configuration...\e[0m"
if docker-compose up -d; then
    sleep 10
    homewayStatus=$(docker ps --filter "name=homeway" --format "{{.Names}} - {{.Status}}")
    if [ -n "$homewayStatus" ]; then
        echo -e "\e[32m✅ Homeway container started successfully!\e[0m"
        echo -e "\e[37mStatus: $homewayStatus\e[0m"
    else
        echo -e "\e[31m❌ Container still not running. Checking logs...\e[0m"
        docker logs homeway
        exit 1
    fi
else
    echo -e "\e[31m❌ Error starting container.\e[0m"
    echo -e "\e[33mChecking container logs...\e[0m"
    docker logs homeway
    exit 1
fi

echo ""
echo -e "\e[36m=== GETTING SETUP URL ===\e[0m"
sleep 10

setupUrl=$(docker logs homeway 2>&1 | grep -o "https://homeway\.io/getstarted[^ ]*" | tail -1)

if [ -n "$setupUrl" ]; then
    echo ""
    echo -e "\e[32m🎉 SETUP URL FOUND!\e[0m"
    echo ""
    echo -e "\e[37mOpen this URL in your browser:\e[0m"
    echo -e "\e[36m$setupUrl\e[0m"
    echo ""
else
    echo -e "\e[33mSetup URL not found in logs yet. Run this command:\e[0m"
    echo -e "\e[36mdocker logs homeway | grep 'https://homeway.io/getstarted'\e[0m"
fi

echo ""
echo -e "\e[32m=== STATUS CHECK ===\e[0m"
echo -e "\e[37mHomeway container:\e[0m"
docker ps --filter "name=homeway"
echo ""
echo -e "\e[37mHome Assistant container:\e[0m"
docker ps --filter "name=homeassistant"

