<article>
    <div class="art">
        <header>
            <div class="hd">
                <div class="heade-text">
                    <h1>ABOUT I SAINT THE POET</h1>
                    <p>__</p>
                </div>
            </div>
        </header>
        <main>
            <div class="mn">
                <div class="image">
                    <div class="img"><img src="/assets/displayphoto.jpg" width="100px" alt="innocent"></div>
                </div>
            </div>
            <div class="text">
                <div class="txt">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut vel distinctio ullam ducimus vero molestias? Autem sed nisi magni obcaecati blanditiis. Perspiciatis ea animi, tenetur nobis accusamus maxime ducimus enim provident quos fuga, quibusdam corrupti nihil consequatur dignissimos! Cupiditate magni inventore dignissimos earum fugiat aut nesciunt sed nostrum ea deserunt.</p>
                </div>
            </div>
        </main>
    </div>
</article>
<style lang="scss">
    article{
        .art{
            main{
                .mn{
                    .image{
                        .img{
                            width: 100%;
                            img{
                                width:100%;
                                position: relative;
                            }
                            img::after{
                                content: "";
                                position: absolute;
                                background: red;
                                width: 60px;
                                height: 70px;

                            }
                        }
                    }
                }
            }
        }
    }
</style>