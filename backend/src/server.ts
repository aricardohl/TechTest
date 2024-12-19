import express from "express"
import cors from "cors"
import multer from "multer"
import csvToJson from "csvtojson"


const app = express()
const port = process.env.PORT || 3000

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

let userData = <Array<Record<string, string>>>[]

app.use(cors())

// @ts-ignore
app.post('/api/files', upload.single('file'), async (req, res) => {
    // Extract file from request
    const file = req.file
    // Validate that we have the file 
    if (!file) {
        return res.status(500).json( { mesasage: 'File is required' } )
    }
    // Validate the mimetype (csv)
    if (file.mimetype !== 'text/csv') {
        return res.status(500).json( { mesasage: 'File must be CSV' } )
    }
    // Transform the file (buffer) to string
    let json: Array<Record<string, string>> = []
    try {
        const rawCSV = Buffer.from(file.buffer).toString('utf-8')
        console.log(rawCSV)
        // Transform string (csv) to JSON
        json = await csvToJson().fromString(rawCSV)  
        
    } catch (error) {
        return res.status(500).json( { mesasage: 'Error parsing file' } )
        
    }
    // Save JSON to db
    userData = json
    // Return 200 with message and JSON
    return res.status(200).json({ data: json, message: 'EL archivo se cargo correctamente' })

})

//@ts-ignore
app.get('/api/users', async ( req, res) => {
    // Extract query param q from the request
    const { q } = req.query
    // Validate that we have the query param
    if (!q) {
        return res.status(500).json({ message: 'Query param q is required' })
    }

    if (Array.isArray(q) ){
        return res.status(500).json({ message: 'Query param q must be a string' })
    }
    // Filter the data from the db with the query param
    const search = q.toString().toLowerCase()

    const filterData = userData.filter(row => {
        return Object
        .values(row)
        .some(value => value.toLowerCase().includes(search)
    )
    })
    // Return 200 with the filtered data
    return res.status(200).json({ data: filterData })
})

app.listen(port, () => {
    console.log(`Server is running in localhost: ${port}`)
})