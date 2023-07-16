const ghpages = require('gh-pages');
const options = {
  repo: 'https://github.com/kotcher1/piskel',
};

ghpages.publish('dist', options, function(err) {
  console.log(err);
});