curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash - 
sudo apt-get install -y nodejs
sudo apt install -y nodejs-legacy
sudo apt install -y npm
sudo npm install -g grunt-cli
sudo npm install -g istanbul
cd EveryPass
mkdir coverage
sudo npm install
cd ../common
mkdir coverage
sudo npm install
cd ../WhisperNote
mkdir coverage
sudo npm install
wget https://github.com/mozilla/geckodriver/releases/download/v0.20.0/geckodriver-v0.20.0-linux32.tar.gz
tar -xvzf geckodriver*
chmod +x geckodriver
export PATH=$PATH:/path-to-extracted-file/geckodriver
