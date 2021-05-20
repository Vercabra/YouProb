const config =  require('./s_request.json')

config.forEach(source =>{
    test(`Results amount for ${source.q}`, () => {
        expect(JSON.stringify(source.result.length)).toBe(source.amount)
    })
})