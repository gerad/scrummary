set -evu

if [ -z $1 ]; then
  echo "USAGE: $0 hostname"
  exit 1
fi

# set the hostname
hostname=$1
hostname $hostname
echo "$hostname" > /etc/hostname

# Updating apt packages...
apt-get update

# Installing git...
apt-get install -y git-core

# Installing node...
apt-get install -y python-software-properties python g++ make
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs

# Setting NODE_ENV=production...
echo "export NODE_ENV=production" > /etc/profile.d/NODE_ENV.sh

# Setting up the root user .ssh/ dir...
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys ~/.ssh/known_hosts
chmod 600 ~/.ssh/authorized_keys ~/.ssh/known_hosts

# Adding github.com to ~/.ssh/known_hosts...
cat <<EOS >> ~/.ssh/known_hosts
github.com,207.97.227.239 ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
EOS

# Setting up the deploy user...
id deploy || useradd -U -m -s /bin/bash deploy

# Setting up the deploy user .ssh/ dir...
deploy_home=/home/deploy
cp -r ~/.ssh $deploy_home/.ssh
chown -R deploy $deploy_home/.ssh

# Setting up runit...
apt-get install -y runit

# Setting runit to run server.js...
mkdir -p /etc/service/serverjs/log

cat <<EOS > /etc/service/serverjs/run
#!/bin/sh
exec 2>&1
. /etc/profile
. $deploy_home/.profile
exec node $deploy_home/current/server.js
EOS
chmod +x /etc/service/serverjs/run

# Setting up runit logging...
mkdir -p $deploy_home/logs/serverjs

cat <<EOS > /etc/service/serverjs/log/run
#!/bin/sh
exec svlogd -tt $deploy_home/logs/serverjs
EOS
chmod +x /etc/service/serverjs/log/run

# Waiting for runit to recognize the new service...
while [ ! -d /etc/service/serverjs/supervise ]; do
  sleep 5 && echo "waiting..."
done
sleep 1

# Turning off the server until the first deploy...
sv stop serverjs
> $deploy_home/logs/serverjs/current

# Giving the deploy user the ability to control the service...
chown -R deploy /etc/service/serverjs/supervise
chown -R deploy $deploy_home/shared

# all done!
