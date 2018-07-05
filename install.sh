#!/bin/sh
sudo apt-get install net-tools -y #Start here
sudo apt-get install curl -y
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs -y
sudo npm install -g grunt-cli
sudo npm install -g istanbul
cd EveryPass
npm install
cd ../common
npm install
cd ../WhisperNote
npm install
cd ../

case $(uname -m) in
x86_64)
    #ARCH=x64
    wget  https://github.com/mozilla/geckodriver/releases/download/v0.20.0/geckodriver-v0.20.0-linux64.tar.gz
    ;;
i*86)
    #ARCH=x86
wget  https://github.com/mozilla/geckodriver/releases/download/v0.20.0/geckodriver-v0.20.0-linux32.tar.gz
    ;;
*)
    #ARCH!=x64 or x86
    ;;
esac

tar -xvzf geckodriver*
chmod +x geckodriver
sudo mv geckodriver /usr/local/bin/

#Install chromedriver
wget https://chromedriver.storage.googleapis.com/2.40/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
chmod +x chromedriver
sudo mv chromedriver /usr/local/bin/
#etc.
