<svelte:head>    
    <meta name="description" content="luanar bssy timetable">
    <meta name="author" content="peter butao">
    <meta name="theme-color" content="#f5f5f5">

</svelte:head>
<script>
    import Carousel from 'svelte-carousel';
    import About from '../components/About.svelte'
    let date = new Date();

    let data = [
        {
            id: 0,
            image: "img (1)",
            name: "home body",
            text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaqueLorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque",
            date: `${date.toLocaleDateString()}`
        },
        {
            id: 1,
            image: "img (2)",
            name: "lorem ipsum",
            text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaqueLorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque",
            date: `${date.toLocaleDateString()}`
        },
        {
            id: 2,
            image: "img (3)",
            name: "sun",
            text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaqueLorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque",
            date: `${date.toLocaleDateString()}`
        },
    ]
</script>
<article>
    <header>
        <div class="header-txt">
            <h1>WELCOME TO <span> I SAINT </span> POEMS</h1>
            <div class="header-subtxt">
                <p>POEMS BY I SAINT THE POET</p>
            </div>
            <p class="line">_</p>
        </div>

    </header>
    <main>
        <div class="mn">

            <div class="headcard">
                <div class="hc">
                    <div class="date">
                        <p>{date.toLocaleDateString()}</p>
                    </div>
                    <div class="hc-content">
                        <div class="hcc-text">
                            <h1>HOME BODY</h1>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam, corrupti quaerat ipsum atque dolorem fugit consequatur Velit ut, neque officia nesciunt quo itaque.</p>
                        </div>
                        <div class="hcc-button">
                            <a class="youtube" href="https://youtube">
                                <p>you tube</p>
                            </a>
                            <a class="download" href="document">
                                <p>download</p>
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            <div class="carousel-cards">
                <div href="/" class="cr-cards">
                    <Carousel
                    arrows={false}
                    autoplay={true}
                    autoplayDuration={4000}
                                                
                    >
                    {#each data as  {id,name, image, date,text}}
                    
                        <a href="{id}" class="card">
                            <div class="cd">
                                <div class="image">
                                    <div class="img">
                                        <img 
                                        src="/assets/{image}.jpg" alt="artwork"
                                        width="50px"
                                        >
                                    </div>
                                </div>
                                <p>_</p>

                                <h1>{name}</h1>
                                <div class="date">
                                    <p>{date}</p>                        

                                </div>
                                <div class="text">

                                    <p>{text.substring(0,80)}</p>
                                </div>
                            

                            </div>
                        </a>
                    
                    {/each}
                    </Carousel>
                    <div class="download-btn">
                        <a href="/">
                            download                     
                        </a>
                    </div>
                </div>
            </div>
        </div>

    </main>
    <section class="sections">
        <div class="sect">

            <div class="about-section">
                <div class="abt-sect">
                    <About />
                </div>
            </div>
        </div>
    </section>
</article>

<style lang="scss">
        @mixin font($c, $s, $w) {
        font-family:Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
        color:$c;
        font-size: $s;
        font-weight:$w;

    }
    article{
        padding-left: 10px;
        padding-right: 10px;
        background: var(--bc);
        min-height: 100vh;
        header{
            padding: 15vh 0;
            padding-bottom: 5vh;
            .line{
                background: var(--dbl);
                width: 25%;
                height: 1px;
                color: var(--dbl);
                
            }
            
            h1{
                
                @include font(var(--tc), 1rem, 750);
                padding:3px 0;
                span{
                    color: var(--lbl);
                }
            }
            p{
                @include font(var(--tc), 0.8rem, 500);
            }
        }
        main{
            padding:20px 0px;
            .mn{
                .carousel-cards{
                    margin: 20px  0;
                    //box-shadow: #2721216c 0px 6px 11px 3px; 
                    background: var(--fbl);
                    
                    .cr-cards{
                        .download-btn{
                            text-align: end;  
                            padding: 10px;                            
                            a{
                                text-decoration: none;
                                
                                padding: 10px 15px;
                    
                                box-shadow: #0000002c 0px 6px 11px 3px;
                                
                                    color: var(--lc);
                                    background-color: var(--dbl);

                                
                            }
                        }
                        a{
                            text-decoration: none;
                        }
                    
                        .card{        
                            background: var(--fbl);
                            max-width: 80px !important;
                            
                            .cd{
                                padding: 10px;
                                .image{
                                    .img{
                                        img{
                                            width: 100%;
                                            height: 200px;
                                            
                                            background-color: black;
                                            background-blend-mode: multiply
                                        }
                                        
                                    }

                                }
                                h1{
                                    @include font( var(--dbl), 1rem, 600);
                                    margin:2px;
                                    text-transform: uppercase;

                                }
                                .date{
                                    text-align: end;
                                    p{
                                        @include font( var(--bl), 0.7rem, 600)
                                    }
                                }
                                .text{
                                    text-align: center;
                                    p{
                                        @include font( var(--tc), 0.9rem, 500)
                                    }
                                }
                            }


                        }
                    }
                }
                .headcard{
                    padding: 10px;
                    background: var(--fbl);
                    .hc{
                        .hc-content{
                            .hcc-button{
                                
                                display:flex;
                                align-items: center;
                                justify-content: space-between;
                                a{
                                    text-decoration: none;
                                    box-shadow: #0000002c 0px 6px 11px 3px;
                                    padding: 10px 15px;
                                    p{
                                        padding:0;
                                        margin: 0;
                                        @include font(var(--lc), 0.9rem, 500)
                                    }
                                }
                                .youtube{
                                    background: red;
                                    border-radius: 3px 5px;
                                    
                                }
                                .download{
                                    color: var(--tc);
                                    background-color: var(--dbl);
                                    
                                }
                            }
                            .hcc-text{
                                p{

                                    @include font(var(--tc), 0.8.5rem, 500);

                                }
                                h1{
                                    margin:0;
                                    padding:0;
                                    @include font( var(--dbl), 1rem, 600)
                                }
                            }
                        }

                        .date{
                            text-align: end;
                            p{
                                letter-spacing: 1px;
                                @include font(var(--tc), 0.75rem,750)
                            }
                        }
                    }
                }
            }
          
        }
    }


</style>