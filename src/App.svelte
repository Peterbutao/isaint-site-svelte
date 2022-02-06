<script>
	import Router, {link} from "svelte-spa-router";
	import Home from "./routes/index.svelte";


	$: open = false;
</script>
<Router routes={{
	"/":Home
}}/>



<section  id="layout">
    <nav class="nav-one">
        <div class="nv">
            <div class="brand">
                <a href="/">
                    <h1>I SAINT</h1>
                </a>        
            </div>

            <div on:click={() => {open = !open}} class="menu">
                <div class="line-1"></div>
                <div class="line-2"></div>
                <div class="line-3"></div>
            </div>
            
            <div class:open={open} on:click={() => {open = !open}} class="nav-bar">
                <ul on:click={() => {open = open}} class="navlist">
                    <li><a href="https://github.com/Peterbutao/luanar-site-svelte.git">GET INVOLVED</a></li>
                    <li><a href="https://github.com/Peterbutao/luanar-site-svelte.git">DOCS</a></li>
                    <li><a href="https://github.com/Peterbutao/luanar-site-svelte.git/licence">LICENCE</a></li>
                    <li><a href="tel://0880164455">CONTACT</a></li>            

                </ul>
            </div>
        </div>
    </nav>
    <main class="content">
        <slot></slot>
    </main>
    <footer class="foot">
        <div class="ft">

           
            <ul class="navlist">
                
               <li><a href="/"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15" height="15" viewBox="0 0 15 15"><defs><clipPath id="a"><rect width="15" height="15" transform="translate(107 766)" fill="#fff" stroke="#707070" stroke-width="1"/></clipPath><clipPath id="b"><rect width="13.846" height="15" fill="none"/></clipPath></defs><g transform="translate(-107 -766)" clip-path="url(#a)"><g transform="translate(107.577 766)" clip-path="url(#b)"><rect width="13.846" height="15" fill="none"/><path d="M12.115,1.833H1.731L6.923,6.417ZM0,1.833A1.789,1.789,0,0,1,1.731,0H12.115a1.789,1.789,0,0,1,1.731,1.833V9.167A1.789,1.789,0,0,1,12.115,11H1.731A1.789,1.789,0,0,1,0,9.167Z" transform="translate(0 2)" fill="#fff" fill-rule="evenodd"/></g></g></svg></a></li>
               <li><a href="/"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15" height="15" viewBox="0 0 15 15"><defs><clipPath id="a"><rect width="15" height="15" transform="translate(289 766)" fill="#fff" stroke="#707070" stroke-width="1"/></clipPath><clipPath id="b"><rect width="13.846" height="15" fill="none"/></clipPath></defs><g transform="translate(-289 -766)" clip-path="url(#a)"><g transform="translate(289.577 766)" clip-path="url(#b)"><rect width="12.923" height="14" fill="none"/><path d="M197,15.989V8.7h2.3l.329-2.844H197V4.078c0-.8.246-1.422,1.313-1.422h1.395V.078c-.328,0-1.148-.089-2.051-.089a3.038,3.038,0,0,0-2.476,1.027,3.6,3.6,0,0,0-.888,2.706V5.856H192V8.7h2.3v7.289Z" transform="translate(-188.79 0.011)" fill="#fff" fill-rule="evenodd"/></g></g></svg></a></li>
               <li><a href="/"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15" height="15" viewBox="0 0 15 15"><defs><clipPath id="a"><rect width="15" height="15" transform="translate(16 766)" fill="#fff" stroke="#707070" stroke-width="1"/></clipPath><clipPath id="b"><rect width="13.846" height="15" fill="none"/></clipPath></defs><g transform="translate(-16 -766)" clip-path="url(#a)"><g transform="translate(16.577 766)" clip-path="url(#b)"><rect width="12.923" height="14" fill="none"/><path d="M95.225,15.967a7.068,7.068,0,0,0,5.261-2.331,8.313,8.313,0,0,0,2.151-5.7V7.553A6.039,6.039,0,0,0,103.908,6.1a5.52,5.52,0,0,1-1.482.459,2.945,2.945,0,0,0,1.13-1.53,6.188,6.188,0,0,1-1.624.688,2.439,2.439,0,0,0-1.907-.917,2.77,2.77,0,0,0-2.612,2.83,1.608,1.608,0,0,0,.07.612,7.135,7.135,0,0,1-5.366-2.983,3.092,3.092,0,0,0,.777,3.824,2.248,2.248,0,0,1-1.2-.382h0a2.749,2.749,0,0,0,2.118,2.753,2.017,2.017,0,0,1-.706.076,1.115,1.115,0,0,1-.494-.076,2.712,2.712,0,0,0,2.471,1.989,5.077,5.077,0,0,1-3.247,1.224,1.812,1.812,0,0,1-.636-.077,6.319,6.319,0,0,0,4.025,1.377" transform="translate(-91.2 -2.8)" fill="#fff" fill-rule="evenodd"/></g></g></svg></a></li>
               <li><a href="/"></a></li>           

            </ul>

            <p>&copy BUTAO UX / UI DEV | 2021</p>
            
           


        </div>
    </footer>

</section>

<style lang="scss">
    :global(body) {
        color: blue;
        background: var(--nv);
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    :root{
        --dbl: #164b4d;
        --lbl:#2699fb;
        --fbl: #ccd7d7;
        --tc: hsl(182, 56%, 5%);
        --lc: #fff5ee;

        //old
        --bc:hsl(0, 0%, 95%);
        --nv:hsl(0, 0%, 92%);
        --bl:#2699fb;
        --fb:#EBF1F6;
        --fm: #d3dee7;
        --tbc: #d3dee7;
    }
   
    @mixin font($c, $s, $w) {
        font-family:Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
        color:$c;
        font-size: $s;
        font-weight:$w;

    }
    #layout{
        .nav-one{

            z-index: 99;
            position: fixed;
            width: 100%;
            background: var(--nv);
            top: 0;
            left: 0;
            .nv{
                box-shadow: #0000002c 0px 3px 11px 0px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: var(--nv);
                .menu{
                    padding: 20px 10px;
                    position: relative;
                
                    z-index: 99;
                    div{
                        width: 20px;
                        height: 3px;
                        background: var(--tc);
                     
                    }
                    .line-2{
                        margin: 5px 0px;
                        width: 12px;
                    }
                   
                    
                }
                .brand{
                    a{
                        display: flex;
                        align-items: center;
                        padding: 3px 5px;
                        text-decoration: none;
                        h1{
                            padding: 0px 1px;
                            @include font(var(--tc), 1rem, 600);  
                        }
                    }
                }
                .open{
                    width: 100% !important;
                    transition: all 1s ease !important;
                    opacity: 100% !important;
                    pointer-events: all !important;
                }
                .nav-bar{
                    z-index: 9;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background: #0000001e;
                    opacity: 0;
                    width:0;
                    height: 100vh;
                    overflow: hidden;
                    padding: 0;
                    transition: all 0.5s ease;
                    pointer-events: none;

                    .navlist{
                    
                        background: var(--fb);
                        height: 100vh;
                        width: 65%;
                    }
                    ul{
                        margin: 0;
                        padding: 20vh 0;
                        li{
                            list-style: none;
                            padding: 20px 10px;
                            a{
                                text-decoration: none;
                                @include font(var(--tc), 0.95rem, 500);
                                
                                span{
                                    padding: 0px 5px;
                                    svg{
                                        filter: grayscale(50%);
                                    }
                                }
                                
                            }
                            &:hover{
                                background: #2699fb;
                            }
                        }
                    }
                }
            }

        }
        .foot{
            box-shadow: #0000009e 0px -6px 17px 3px; 
            position: fixed;
            width: 100%;
            max-height: 5vh;
            bottom: 0;
            background: var(--dbl);
            border-top-left-radius: 2rem;
            border-top-right-radius: 2rem;
            
            .ft{
                padding: 0px 20px;
                display: flex;
                justify-content: space-between;
                flex-direction:column;
                ul{
                        margin: 0;
                        padding:0;
                        padding-top: 10px;
                        display: flex;

                        
                        li{
                            list-style: none;
                            padding: 10px 0px;
                        
                            a{
                                text-decoration: none;
                                @include font(var(--tc), 0.95rem, 300);
                                
                            
                                
                            }
                            
                        }
                    }
                
               
            }

        }
    }
</style>