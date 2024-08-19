Single file compilation

https://nodejs.org/api/single-executable-applications.html

nvm use 22

npm build
echo '{ "main": "out.js", "output": "sea-prep.blob" }' > sea-config.json
node --experimental-sea-config sea-config.json
cp $(command -v node) tl4kIotServer
npx postject tl4kIotServer NODE_SEA_BLOB sea-prep.blob     --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

./tl4kIotServer