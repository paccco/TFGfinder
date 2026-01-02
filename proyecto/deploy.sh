doctl compute droplet create \
    --image docker-20-04 \
    --size s-1vcpu-2gb \
    --region fra1 \
    --enable-monitoring \
    dockeronubuntu2204host
