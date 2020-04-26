<script>
    import axios from 'axios';
    let name = "";

    function handleSubmit(e) {
        axios.get(`/api/get-total-pages/type/m/name/${name}`)
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <label>Movie Name</label>
    <input type=text on:change={(e) => name = e.target.value}/>

    <input type="submit" value="Check honesty" />
</form>