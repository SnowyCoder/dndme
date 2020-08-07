<template>
    <div class="footer">
        <div class="credits">
            <div class="links">
                <a href="https://github.com/SnowyCoder/dndme" target="_blank" class="github"></a>
            </div>
            <small style="color: lightgray">
                Developed by <a href="https://github.com/SnowyCoder" target="_blank" class="profile">Rossi Lorenzo</a> /
                Drawings by <span style="color: white">Giorgia Nizzoli</span>
            </small>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
    });
</script>

<style scoped>
    .credits {
        text-align: right;
        padding: 20px;
    }

    .github {
        display: inline-block;
        width: 32px;
        height: 32px;
        background-image: url("~Public/images/GitHub-Mark-Light-32px.png");
    }

    .github:hover {
        opacity: 0.5;
    }

    .profile {
        color: white;
    }

    .profile:hover {
        opacity: 0.5;
    }

</style>
