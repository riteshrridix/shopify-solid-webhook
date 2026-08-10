export default async function handler(req, res) {

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {

        // Vercel already parses JSON request body
        const requestBody = req.body;

        console.log('=================================');
        console.log('SHOPIFY REQUEST');
        console.log('=================================');
        console.log(JSON.stringify(requestBody, null, 2));


        // Check request body
        if (!requestBody || typeof requestBody !== 'object') {

            return res.status(400).json({
                success: false,
                error: 'Invalid JSON request body'
            });

        }


        // Abort Solid request after 15 seconds
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 15000);


        let solidResponse;

        try {

            solidResponse = await fetch(
                'https://app.solidwebhook.com/api/v1/webhooks/f0503c82-819a-4fcd-ab50-ebb58f44b8ad',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        'X-SOLID-TOKEN': process.env.SOLID_TOKEN
                    },

                    body: JSON.stringify(requestBody),

                    signal: controller.signal
                }
            );

        } finally {

            clearTimeout(timeout);

        }


        // Read Solid response
        const responseText = await solidResponse.text();


        console.log('=================================');
        console.log('SOLID WEBHOOK RESPONSE');
        console.log('=================================');
        console.log('STATUS:', solidResponse.status);
        console.log('BODY:', responseText);


        // Return Solid response to Shopify
        return res.status(solidResponse.ok ? 200 : 502).json({

            success: solidResponse.ok,

            solid_status: solidResponse.status,

            solid_response: responseText

        });


    } catch (error) {

        console.error('=================================');
        console.error('WEBHOOK ERROR');
        console.error('=================================');
        console.error(error);


        // Solid Webhook timeout
        if (error.name === 'AbortError') {

            return res.status(504).json({

                success: false,

                error: 'Solid Webhook timed out after 15 seconds'

            });

        }


        return res.status(500).json({

            success: false,

            error: error.message

        });

    }
}
