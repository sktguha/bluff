var rmdir = require('rmdir');
rmdir( './storage', function ( err, dirs, files ){
  console.log( dirs );
  console.log( files );
  console.log( 'all files are removed' );
});