export default async function handler(request) {

    // Only allow POST
    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Method not allowed'
            }),
            {
                status: 405,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    try {

        // Get Shopify request body
        const requestBody = await request.json();

        console.log('=================================');
        console.log('SHOPIFY REQUEST');
        console.log('=================================');
        console.log(JSON.stringify(requestBody, null, 2));

        // Send request to Solid Webhook
        const solidResponse = await fetch(
            'https://app.solidwebhook.com/api/v1/webhooks/f0503c82-819a-4fcd-ab50-ebb58f44b8ad',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'X-SOLID-TOKEN': process.env.SOLID_TOKEN
                },

                body: JSON.stringify(requestBody)
            }
        );

        // Get Solid response
        const responseText = await solidResponse.text();

        console.log('=================================');
        console.log('SOLID WEBHOOK RESPONSE');
        console.log('=================================');
        console.log('STATUS:', solidResponse.status);
        console.log('BODY:', responseText);

        // Return result to Shopify
        return new Response(
            JSON.stringify({
                success: solidResponse.ok,
                solid_status: solidResponse.status,
                solid_response: responseText
            }),
            {
                status: solidResponse.ok ? 200 : 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error) {

        console.error('WEBHOOK ERROR:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}