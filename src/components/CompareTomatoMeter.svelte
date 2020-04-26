<script context="module">
    import hljs from 'highlight.js';
    import '../../node_modules/highlight.js/styles/vs.css';
    hljs.initHighlighting();
</script>

<script>
    import axios from 'axios';
    import plusMerge from '../../lib/util/plusmerge';
    import defaultResult from '../../lib/rt/default-review-result';
    import prettyJs from 'pretty-js';

    let name = "";
    let resultHtml = "";

    function handleSubmit(e) {
        axios
            .get(`/api/get-total-pages/type/m/name/${name}`)
            .then(({data: {totalPages}}) => {
                const promises = [];

                for (let i = 0; i < totalPages; i += 1) {
                    promises.push(axios
                        .get(`/api/scrape-rt/type/m/name/${name}/page/${i}`)
                        .then(({data}) => data));
                }

                return Promise.all(promises);
            })
            .then((results) => {
                const allResults = results.reduce(plusMerge, {...defaultResult});
                const formattedJson = prettyJs(JSON.stringify(allResults));
                resultHtml = hljs.highlight("javascript", formattedJson).value;
            })
    }
</script>

<style>
    form {
        margin: 0 auto;
    }

    label, pre {
        margin: 0.666em auto;
    }

    pre {
        text-align: left;
        width: 250px;
    }
</style>

<form on:submit|preventDefault={handleSubmit}>
    <label>Movie Name</label>
    <input type=text on:change={(e) => name = e.target.value}/>

    <input type="submit" value="Check honesty" />
</form>

{#if resultHtml !== ""}
    <label>Result</label>
    <pre class="hljs">
        <code class="javascript">{@html resultHtml}</code>
    </pre>
{/if}