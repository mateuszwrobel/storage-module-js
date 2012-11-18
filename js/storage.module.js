var storageModule = ( function ( window, document, undefined ) {

	var component = null;
	var componentFactory;
	var defaultSettings;
	var factoryInstance = null;
	var getComponenet;
	var mergeObjects;
	var settings;
	var storageComponenet;

	settings = defaultSettings = {
		debug: false,
		expires: 1,
		json: true,
		path: false,
		raw: false,
		storageType: 'cookies'
	};

	mergeObjects = function(objects) {
		var attr;
		var object;
		var mergedObjects = [];

		for (object in objects) {
			for (attr in objects[object]) {
				if ( typeof objects[object][attr] !== undefined)
					mergedObjects[attr] = objects[object][attr];
			}
		}
		return mergedObjects;
	};

	storageComponenet = (function () {
		var cookiesComponent;
		var decoded;
		var getAll;
		var getValue;
		var isset;
		var localStorateComponent;
		var pluses = /\+/g;
		var read;
		var sessionStorageComponenet;
		var setValue;
		var storage;
		var unset;
		var write;

		function storageComponenet() {}

		decode = function ( string ) {
			return decodeURIComponent( string.replace( pluses, ' ' ) );
		};

		setValue = function ( value ) {

			if ( settings.json ) {
				value = JSON.stringify( value );
			} else {
				value = String( value );
			}
			return settings.raw ? value : encodeURIComponent( value );

		};

		getValue = function ( value ) {

			value = ( settings.raw ? value : decode( value ) );

			if ( settings.json ) {
				return JSON.parse( value );
			}
			return value;
		};

		write = function ( name, value, undefined ) {
			if ( name === 'length')
				throw '\'length\' is reserved name of variable';
			
			storage.setItem( name, setValue( value ) );

			return true;
		};


		read = function ( name ) {
			return getValue( storage.getItem( name ) );
		};

		unset = function ( name ) {
			return storage.removeItem( name );
		};

		isset = function ( name ) {
			return name in storage;
		};

		getAll = function () {
			var allData = {};
			var attr;

			allData.length = 0;

			for ( attr in storage ) {
				allData[ attr ] = getValue( storage.getItem( attr ) );
				allData.length += 1;
			}

			return allData;
		};

		cookiesComponent = function() {

			write = function ( name, value, options ) {
				var days;
				var time;
				var oldSettings = {};

				if ( value === null ) {
					time = -1;
				}
				
				if ( typeof options === 'object' ) {
					oldSettings = settings;
					settings = mergeObjects( [ settings, options ] );
				}

				if ( typeof settings.expires === 'number' && time !== -1 ) {
					days = settings.expires;
					time = new Date();
					time.setDate( time.getDate() + days );
				} else if ( typeof settings.expires === 'string' && settings.expires === 'session' ) {
					time = false;
				} else if ( time === -1 ) {
					time = new Date();
					time.setDate( time.getDate() - 1 );
				}

				value = setValue( value );
				document.cookie = [
					encodeURIComponent( name ),
					'=',
					( value ),
					( time ? '; expires=' + time.toUTCString() : '' ),
					( settings.path ? '; path=' + settings.path : '' ),
					( settings.domain ? '; domain=' + settings.domain : '' ),
					( settings.secure ? '; secure' : '' )
				]
				.join( '' );
				
				if ( typeof options === 'object' ) {
					settings = oldSettings;
				}

				return true;
			};

			read = function ( name ) {
				var cookie;
				var part;
				var cookies = document.cookie.split('; ');

				for ( cookie in cookies ) {
					part = cookie.split( '=' );
					if ( decode( part.shift() ) === name ) {
						cookie = part.join( '=' );
						return getValue( cookie );
					}
				}
				return null;
			};

			unset = function ( name ) {
				return write ( name, null );
			};

			isset = function ( name ) {
				var cookie;
				var part;
				var decode = ( settings.raw ? raw : decoded );
				var cookies = document.cookie.split('; ');

				for ( cookie in cookies ) {
					part = cookie.split( '=' );
					if ( decode( part.shift() ) === name ) {
						return true;
					}
				}
				return false;
			};

			getAll = function () {
				var allData = {};
				var cookie;
				var cookies = document.cookie.split('; ');
				var	decode = ( settings.raw ? raw : decoded );
				var name;
				var part;

				for ( cookie in cookies ) {
					part = cookie.split( '=' );
					name = decode( part.shift() );
					cookie = decode( part.join( '=' ) );
					allData[ name ] = getValue( cookie );
				}
				return allData;
			};

			return {
				write: write,
				read: read,
				unset: unset,
				isset: isset,
				getAll: getAll
			};
		};

		localStorageComponent = function () {
			storage = localStorage;
			return {
				write: write,
				read: read,
				unset: unset,
				isset: isset,
				getAll: getAll
			};
		};

		sessionStorageComponenet = function () {
			storage = sessionStorage;
			return {
				write: write,
				read: read,
				unset: unset,
				isset: isset,
				getAll: getAll
			};
		};

		return {
			cookiesComponent: cookiesComponent,
			localStorageComponent: localStorageComponent,
			sessionStorageComponenet: sessionStorageComponenet
		};
	});

	componentFactory = (function () {

		function componentFactory () { }

		this.createComponent = function () {
			var component = 'cookies';
			var components = [
				'cookies',
				'localStorage',
				'sessionStorage'
			];

			if ( component !== settings.storageType && components.indexOf(settings.storageType) > -1 ) {
				if ( !( typeof Storage !== "undefined" && Storage !== null ) ) {
					if ( typeof console === 'object') {
						console.log( 'Browser doesn\'t support Storage. Cookies used instead.' );
					}
					settings.path = '/';
					if ( settings.storageType === 'sessionStorage' ) {
						settings.expires = 'session';
					} else if ( settings.storageType === 'localStorage' ) {
						settings.expires = 366*10;
					}
					settings.storageType = 'cookies';
				}
			} else if ( components.indexOf( settings.storageType ) === -1 ) {
				if ( typeof console === 'object' ) {
					console.log( 'Unnown storage type' );
					return null;
				}
			}

			component = settings.storageType + 'Component';
			return new storageComponenet()[ component ]();
		};

	});

	getComponenet = function () {
		if ( component === null ) {
			factoryInstance = new componentFactory();
			component = factoryInstance.createComponent();
		}
		return component;
	};
	return {
		setup: function ( newSettings ) {
			settings = mergeObjects( [ defaultSettings, newSettings ] );
			return this;
		},
		write: function ( name, value, options ) {
			return getComponenet().write( name, value, options );
		},
		read: function ( name ) {
			return getComponenet().read( name );
		},
		unset: function ( name ) {
			return getComponenet().unset( name );
		},
		isset: function ( name ) {
			return getComponenet().isset( name );
		},
		getAll: function () {
			return getComponenet().getAll();
		}
	};

})( window, document );