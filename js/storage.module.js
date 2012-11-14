var storageModule = ( function ( window, document, undefined ) {

	var settings;
	var defaultSettings;
	var mergeObjects;
	var storageComponenet;
	var getComponenet;
	var componentFactory;
	var factoryInstance = null;
	var component = null;

	settings = defaultSettings = {
		debug: false,
		expires: 1,
		json: false,
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
		var unset;
		var write;

		function storageComponenet() {}

		decode = function ( string ) {
			return decodeURIComponent( string.replace( pluses, ' ' ) );
		};

		setValue = function ( value ) {

			value = settings.raw ? value : encodeURIComponent( value );

			if ( settings.json ) {
				return JSON.stringify( value );
			}

			return String( value );
		};

		getValue = function ( value ) {

			value = ( settings.raw ? value : decode( value ) );

			if ( settings.json ) {
				return JSON.parse( value );
			}
			return value;
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
				var cookie, part,
					decode = ( settings.raw ? raw : decoded ),
					cookies = document.cookie.split('; ');

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
			return {
				write: function ( name, value, undefined) {
					return localStorage.setItem( name, setValue( value ) );
				},
				read: function ( name ) {
					return getValue( localStorage.getItem( name ) );
				},
				unset: function ( name ) {
					return localStorage.removeItem( name );
				},
				isset: function ( name ) {
					return name in localStorage;
				},
				getAll: function () {
					var allData = {};
					var attr;

					for ( attr in localStorage ) {
						allData[ attr ] = getValue( localStorage.getItem( attr ) );
					}

					return allData;
				}
			};
		};

		sessionStorageComponenet = function () {
			return {
				write: function ( name, value, undefined ) {
					return sessionStorage.setItem( name, setValue( value ) );
				},
				read: function ( name ) {
					return getValue( sessionStorage.getItem( name ) );
				},
				unset: function ( name ) {
					return sessionStorage.removeItem( name );
				},
				isset: function ( name ) {
					return sessionStorage.hasOwnProp ( name );
				},
				getAll: function () {
					var allData = {};
					var attr;

					for ( attr in sessionStorage ) {
						allData[ attr ] = getValue( sessionStorage.getItem( attr ) );
					}

					return allData;
				}
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

			console.log (component+' '+settings.storageType+' '+components.indexOf(settings.storageType));
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
			} else if ( components.indexOf(settings.storageType) === -1 ) {
				if ( typeof console === 'object') {
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