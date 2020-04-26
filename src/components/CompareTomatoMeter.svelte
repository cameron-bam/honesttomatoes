<script>
    import axios from 'axios';
    import plusMerge from '../../lib/util/plusmerge';
    import defaultResult from '../../lib/rt/default-review-result';
    let name = "";
    let result = "";

    function handleSubmit(e) {
        axios
            .get(`/api/get-total-pages/type/m/name/${name}`)
            .then(({data: {totalPages}}) => {
                const promises = [];

                for (let i = 0; i < totalPages; i += 1) {
                    promises.push(axios.get(`/api/scrape-rt/type/m/name/${name}/page/${i}`));
                }

                return Promise.all(promises);
            })
            .then((results) => {
                result = JSON.stringify(results.reduce(plusMerge, {...defaultResult}));
            })
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <label>Movie Name</label>
    <input type=text on:change={(e) => name = e.target.value}/>

    <input type="submit" value="Check honesty" />
</form>

<label>Result</label>
<textarea>
{result}
</textarea>