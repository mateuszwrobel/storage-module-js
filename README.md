# storage.module.js

Simple standalone module for reading, writeng and deleting cookies and also for handling localStorage and sessionStorage.


## Installation
You don't need any additional library.

    <script src="/path/to/storage.module.js"></script>

## Usage

Simple cookie creation:

	storageModule.write('cookie', 'cookie value');

Simple cookie reading:

	storageModule.read('cookie');

Simple cookie remove:

	storageModyle.unset('cookie');

A little better cookie creation:

	var cookieLayer = storageModule.setup();
	cookieLayer.write('cookie', 'cookie value');

Cookie creation with settings:

	var cookieLayer = storageModule.setup(
			{
				json: true,
				path: your/path,
				domain: your.domain,
				expires: 1, // days to expire
				secure: true
				raw: true // no encoding
			}
		);

Simple localStorage creation:

	storageModule.setup({storageType: 'localStorage'}).write('localVar', 'local var value');

Simple localStorage reading:

	storageModule.setup({storageType: 'localStorage'}).read('localVar');

A better localStorage handling:

	var localStorageLayer = storageModule.setup({storageType: 'localStorage'});
	localStorageLayer.write('localVar', 'local var value');
	if (localStorageLayer.isset('localVar'))
		localStorageLayer.read('localVar');

Session Storage is the same like local storage.

Public functions:

	function write (key, value)
	function read (key)
	function unset (key)
	function isset (key)
	function getAll ()

## Development

- Source hosted at [GitHub](https://github.com/Okotetto/storage-module-js)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/Okotetto/storage-module-js/issues)

Pull requests are very welcome! Make sure your patches are well tested. Please create a topic branch for every separate change you make.

## Authors

[Mateusz Wróbel](https://github.com/Okotetto)

Cookie handling by
[Klaus Hartl](https://github.com/carhartl) [jquery-cookie](https://github.com/carhartl/jquery-cookie)