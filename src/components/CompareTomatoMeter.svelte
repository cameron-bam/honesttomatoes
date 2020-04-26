<script context="module">
    import hljs from 'highlight.js';
    import '../../node_modules/highlight.js/styles/vs.css';
    hljs.initHighlighting();
</script>

<script>
    import axios from 'axios';
    import plusMerge from '../../lib/util/plusmerge';
    import defaultResult from '../../lib/rt/default-review-result';
    import getNameAndType from '../../lib/rt/get-name-type-from-rt-link';
    import prettyJs from 'pretty-js';

    let url = "";
    let resultHtml = "";

    function handleSubmit(e) {
        const {name, type} = getNameAndType(url);

        axios
            .get(`/api/get-total-pages/type/${type}/name/${name}`)
            .then(({data: {totalPages}}) => {
                const promises = [];

                for (let i = 0; i < totalPages; i += 1) {
                    promises.push(axios
                        .get(`/api/scrape-rt/type/${type}/name/${name}/page/${i}`)
                        .then(({data}) => data));
                }

                return Promise.all(promises);
            })
            .then((results) => {
                const allResults = results.reduce(plusMerge, {...defaultResult});
                allResults.rtScore = Math.round(100 * (allResults.rtFresh / (allResults.reviewCount - allResults.rtUnknown)));
                allResults.osScore = Math.round(100 * (allResults.osFresh / (allResults.reviewCount - allResults.osUnknown)));
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

    input[type="text"] {
        display: block;
        margin: 0.666em auto;
        width: 500px;
    }
</style>

<form on:submit|preventDefault={handleSubmit}>
    <label>Movie Link</label>
    <input type=text on:change={(e) => url = e.target.value}/>

    <input type="submit" value="Check honesty" />
</form>

{#if resultHtml !== ""}
    <label>Result</label>
    <pre class="hljs">
        <code class="javascript">{@html resultHtml}</code>
    </pre>
{/if}