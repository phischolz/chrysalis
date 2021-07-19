class GetRequestSender {
    /**
     * Fetching
     * @param url
     * @returns {Promise<{data: any, error: null} | {error: *}>}
     */
    send = (url) => {
        return fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw Error("Could not fetch the data for the resource " + url)
                }
                return res.json()
            })
            .then(data => {
                return {data:data, error: null}
            })
            .catch(err => {
                return {error: err.message}
            })
    }
}

module.exports = GetRequestSender