###

Stand alone module for cookies/local storage/session storage

###


storageModule = ((window, document) ->
    settings = defaultSettings =
        storageType: 'cookies'
        debug: false
        raw: false
        json: false

    factoryInstance = component = null

    # function to merge objects
    merge_options = (objects) ->
        for object of objects
            for attr of objects[object]
                settings[attr] = objects[object][attr]
        settings

    class storageComponent
        @pluses = /\+/g

        constructor: () ->

        @raw = (string) ->
            string

        @decode = (string) ->
            decodeURIComponent string.replace @pluses, ' '

        setValue: (value) ->
            value = if settings.raw then value else encodeURIComponent value

            (if settings.json then JSON.stringify(value) else String(value))

        getValue: (value) ->
            value = if settings.raw then value else @decode value

            (if settings.json then JSON.parse(value) else value)

    class cookiesComponent extends storageComponent
        constructor: () ->

        write: (name, value) =>
            time = -1 if value is null
            
            if typeof settings.expires is 'number' and time isnt -1
                days = settings.expires
                time = new Date()
                time.setDate(time.getDate()+days)
            else if time is -1
                time = new Date()
                time.setDate(time.getDate()-1)

            value = @setValue value

            document.cookie = [
                    encodeURIComponent(name)
                    '='
                    (if settings.raw then value else encodeURIComponent(value))
                    (if time then '; expires=' + time.toUTCString() else '')
                    (if settings.path then '; path=' + settings.path else '')
                    (if settings.domain then '; domain=' + settings.domain else '')
                    (if settings.secure then '; secure' else '')
                ].join ''

        read: (name) ->
            decode = (if settings.raw then @raw else @decoded)
            cookies = document.cookie.split('; ')

            
            for cookie in cookies
                part = cookie.split('=')
                if decode(part.shift()) is name
                    cookie = decode(part.join('='))
                    return @getValue cookie

        unset: (name) ->
            @write(name, null)

        isset: (name) ->
            decode = (if settings.raw then @raw else @decoded)
            if document.cookie?
                cookies = document.cookie.split('; ')

                for cookie in cookies
                    part = cookie.split('=')
                    if decode(part.shift()) is name
                        return true
            false

        getAll: () ->
            decode = (if settings.raw then @raw else @decoded)
            cookies = document.cookie.split '; '

            allData = []
            for cookie in cookies
                part = cookie.split '='
                name = decode part.shift
                cookie = decode part.join '='
                allData[name] = cookie
            allData


    class sessionStorageComponent extends storageComponent
        constructor: () ->

        write: (name, value) ->
            sessionStorage.setItem name, @setValue value

        read: (name) ->
            @getValue sessionStorage.getItem name

        unset: (name) ->
            sessionStorage.removeItem name

        isset: (name) ->
            sessionStorage.hasOwnProp name

        getAll: () ->
            allData = []
            for attr of sessionStorage
                allData[attr] = @getValue sessionStorage[attr]
            allData

    class localStorageComponent extends storageComponent
        constructor: () ->

        write: (name, value) ->
            localStorage.setItem name, @setValue value

        read: (name) ->
            @getValue localStorage.getItem name

        unset: (name) ->
            localStorage.removeItem name

        isset: (name) ->
            localStorage.hasOwnProp name

        getAll: () ->
            allData = []
            for attr of localStorage
                allData[attr] = @getValue localStorage[attr]
            allData

    components =
        cookiesComponent: cookiesComponent
        localStorageComponent: localStorageComponent
        sessionStorageComponent: sessionStorageComponent

    class componentFactory
        constructor: () ->

        createComponent: =>
            componentClass = 'cookies'
            componenetClasses = [
                'cookies'
                'localStorage'
                'sessionStorage'
            ]
            switch settings.storageType
                when 'localStorage', 'sessionStorage'
                    if not Storage? then settings.storageType = 'cookies'
                    componentClass = settings.storageType
            componentClass = components[settings.storageType + 'Component']
            new componentClass()

    getComponent = () ->
        if component is null
            factoryInstance = new componentFactory()
            component = factoryInstance.createComponent()
        component

    return {
        setup: (newSettings) ->
            newSettings = newSettings || {}
            settings = merge_options {defaultSettings, newSettings}
            getComponent()

        write: (name, value) ->
            getComponent().write(name,value)

        read: (name) ->
            getComponent().read(name)

        unset: (name) ->
            getComponent().unset(name)

        isset: (name) ->
            getComponent().isset(name)

        getAll: () ->
            getComponent().getAll()
    }
)(window, document)