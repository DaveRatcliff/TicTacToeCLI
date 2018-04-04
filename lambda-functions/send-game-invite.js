const twilio = require('twilio')

const accountSid = process.env.accountSid
const authToken = process.env.authToken
const from = process.env.from
const client = new twilio(accountSid, authToken)

exports.handler = async function ({ httpMethod, headers, body }, context, callback) {
    
    try{ 
        body = JSON.parse(body)
    } catch(e){
        return callback(null, {
            statusCode: 400,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'Body must be JSON' })
        })

    }

    let { to, gameId } = body
    let { 'x-api-key': apiKey } = headers

    // TODO -- Check apiKey to make sure it's valid

    if (!accountSid || !authToken || !from) {
        return callback(null, {
            statusCode: 400,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'One of these environment variables are not set: accountSid, authToken, from' })
        })
    }

    if (!gameId) {
        return callback(null, {
            statusCode: 400,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: '"gameId" parameter not provided!' })
        })
    }
    if (!to) {
        return callback(null, {
            statusCode: 400,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: '"to" parameter not provided!' })
        })
    }

    let message = `You're invited to play a game. Click here: http://site.com/${gameId}`

    let messageId
    try {
        messageId = await sendSms(to, message, from)
    } catch (e) {
        return callback(e.toString())
    }

    return callback(null, {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messageId }),
    })
}

async function sendSms(to, body, from) {
    const message = await client.messages.create({
        body,
        to,
        from,
    })
    return message.sid
}
