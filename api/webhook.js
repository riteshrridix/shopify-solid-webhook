export default async function handler(req, res) {

    // =========================================
    // CORS
    // =========================================

    const allowedOrigin = 'https://silvrlining.in';

    res.setHeader(
        'Access-Control-Allow-Origin',
        allowedOrigin
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'POST, OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    res.setHeader(
        'Access-Control-Max-Age',
        '86400'
    );


    // =========================================
    // Handle CORS preflight
    // =========================================

    if (req.method === 'OPTIONS') {

        return res.status(204).end();

    }


    // =========================================
    // Only allow POST
    // =========================================

    if (req.method !== 'POST') {

        return res.status(405).json({

            success: false,

            error: 'Method not allowed'

        });

    }


    try {

        // =====================================
        // Get Shopify request body
        // =====================================

        const requestBody = req.body;


        console.log(
            '================================='
        );

        console.log(
            'SHOPIFY REQUEST'
        );

        console.log(
            '================================='
        );

        console.log(
            JSON.stringify(
                requestBody,
                null,
                2
            )
        );


        // =====================================
        // Validate request body
        // =====================================

        if (
            !requestBody ||
            typeof requestBody !== 'object'
        ) {

            return res.status(400).json({

                success: false,

                error:
                    'Invalid JSON request body'

            });

        }


        // =====================================
        // Get fields
        // =====================================

        const name =
            requestBody.name || '';

        const email =
            requestBody.email || '';

        const number =
            requestBody.number || '';


        // =====================================
        // Validate fields
        // =====================================

        if (!name || !email || !number) {

            return res.status(400).json({

                success: false,

                error:
                    'Name, email and number are required'

            });

        }


        // =====================================
        // Call Solid Webhook
        // =====================================

        let solidStatus = null;

        let solidResponse = '';

        let success = false;

        let errorMessage = null;


        try {

            // Timeout after 15 seconds
            const controller =
                new AbortController();


            const timeout =
                setTimeout(
                    () => controller.abort(),
                    15000
                );


            try {

                const response =
                    await fetch(
                        'https://app.solidwebhook.com/api/v1/webhooks/f0503c82-819a-4fcd-ab50-ebb58f44b8ad',
                        {

                            method: 'POST',

                            headers: {

                                'Content-Type':
                                    'application/json',

                                'X-SOLID-TOKEN':
                                    process.env.SOLID_TOKEN

                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                number: number

                            }),

                            signal:
                                controller.signal

                        }
                    );


                solidStatus =
                    response.status;


                solidResponse =
                    await response.text();


                success =
                    response.ok;


                console.log(
                    '================================='
                );

                console.log(
                    'SOLID WEBHOOK RESPONSE'
                );

                console.log(
                    '================================='
                );

                console.log(
                    'STATUS:',
                    solidStatus
                );

                console.log(
                    'BODY:',
                    solidResponse
                );


            } finally {

                clearTimeout(timeout);

            }


        } catch (error) {

            console.error(
                'SOLID WEBHOOK ERROR:',
                error
            );


            if (
                error.name ===
                'AbortError'
            ) {

                errorMessage =
                    'Solid Webhook timed out after 15 seconds';

            } else {

                errorMessage =
                    error.message;

            }

        }


        // =====================================
        // Return response to Shopify
        // =====================================

        if (success) {

            return res.status(200).json({

                success: true,

                solid_status:
                    solidStatus,

                solid_response:
                    solidResponse

            });

        }


        return res.status(502).json({

            success: false,

            solid_status:
                solidStatus,

            solid_response:
                solidResponse,

            error:
                errorMessage

        });


    } catch (error) {

        console.error(
            'WEBHOOK ERROR:',
            error
        );


        return res.status(500).json({

            success: false,

            error:
                error.message

        });

    }

}
