export default async function handler(request) {

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

        const requestBody = await request.json();

        console.log('=================================');
        console.log('SHOPIFY REQUEST');
        console.log('=================================');
        console.log(JSON.stringify(requestBody, null, 2));


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


        const responseText = await solidResponse.text();


        console.log('=================================');
        console.log('SOLID RESPONSE');
        console.log('=================================');
        console.log('STATUS:', solidResponse.status);
        console.log('BODY:', responseText);


        return new Response(
            JSON.stringify({
                success: solidResponse.ok,
                solid_status: solidResponse.status,
                solid_response: responseText
            }),
            {
                status: solidResponse.ok ? 200 : 502,

                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );


    } catch (error) {

        console.error('=================================');
        console.error('WEBHOOK ERROR');
        console.error('=================================');
        console.error(error);


        if (error.name === 'AbortError') {

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Solid Webhook timed out after 15 seconds'
                }),
                {
                    status: 504,

                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }


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