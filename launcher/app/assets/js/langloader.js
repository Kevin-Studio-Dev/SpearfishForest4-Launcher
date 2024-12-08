const fs = require('fs-extra')
const path = require('path')
const toml = require('toml')
const merge = require('lodash.merge')

let lang

exports.loadLanguage = function(id){
    try {
        console.log(`Loading language file: ${id}`)
        const filePath = path.join(__dirname, '..', 'lang', `${id}.toml`)
        console.log(`Language file path: ${filePath}`)
        
        if (!fs.existsSync(filePath)) {
            console.error(`Language file not found: ${filePath}`)
            return
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        console.log(`Language file content length: ${fileContent.length} bytes`)
        
        const parsed = toml.parse(fileContent)
        console.log(`Parsed language keys: ${Object.keys(parsed).join(', ')}`)
        
        lang = merge(lang || {}, parsed || {})
        console.log(`Language ${id} loaded successfully`)
    } catch (error) {
        console.error(`Error loading language ${id}:`, error)
    }
}

exports.query = function(id, placeHolders){
    try {
        let query = id.split('.')
        let res = lang
        for(let q of query){
            res = res[q]
            if (res === undefined) {
                return ''
            }
        }
        let text = res === lang ? '' : res
        if (placeHolders) {
            Object.entries(placeHolders).forEach(([key, value]) => {
                text = text.replace(`{${key}}`, value)
            })
        }
        return text
    } catch (error) {
        console.error(`Error querying language key ${id}:`, error)
        return ''
    }
}

exports.queryJS = function(id, placeHolders){
    if(id == null){
        return null
    }
    if(!id.includes('.')){
        return null
    }

    const ids = id.split('.')
    let res = exports.query(ids[0])
    if(res == null) return null

    for(let i=1; i<ids.length; i++){
        res = res[ids[i]]
        if(res == null){
            return null
        }
    }

    return res
}

exports.queryEJS = function(id, placeHolders){
    return exports.query(`ejs.${id}`, placeHolders)
}

exports.setupLanguage = function(){
    try {
        console.log('Setting up languages...')
        // Load Language Files
        exports.loadLanguage('en_US')  // Load English as fallback
        exports.loadLanguage('ko_KR')  // Load Korean as primary
        
        // Load Custom Language File for Launcher Customizer
        if (fs.existsSync(path.join(__dirname, '..', 'lang', '_custom.toml'))) {
            exports.loadLanguage('_custom')
        }
        console.log('Language setup complete')
    } catch (error) {
        console.error('Error in setupLanguage:', error)
    }
}