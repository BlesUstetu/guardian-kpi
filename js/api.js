async request(action, data = null) {

    try {

        // ===========================
        // GET
        // ===========================

        if (data === null) {

            const response = await fetch(

                `${this.BASE_URL}?action=${encodeURIComponent(action)}`

            );

            return await response.json();

        }

        // ===========================
        // POST
        // ===========================

        const form = new URLSearchParams();

        form.append(
            "payload",
            JSON.stringify({
                action,
                ...data
            })
        );

        const response = await fetch(

            this.BASE_URL,

            {

                method: "POST",

                body: form

            }

        );

        return await response.json();

    }

    catch(err){

        console.error(err);

        return {

            success:false,

            message:err.message

        };

    }

}
