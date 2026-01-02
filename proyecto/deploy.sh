doctl compute droplet create \
    --image docker-20-04 \
    --size s-1vcpu-2gb \
    --region fra1 \
    --enable-monitoring \
    --ssh-keys 52977094 \
    --volumes 9efb5fe9-e7f2-11f0-8188-0a58ac12e8a3 \
    dockeronubuntu2204host
    
doctl compute firewall create \
  --name "tfg-firewall" \
  --inbound-rules "protocol:tcp,ports:3000,address:0.0.0.0/0 protocol:tcp,ports:3001,address:0.0.0.0/0 protocol:tcp,ports:22,address:0.0.0.0/0" \
  --droplet-ids $(doctl compute droplet list --format ID --no-header)
