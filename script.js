const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h;
const { sin, cos, PI, hypot, min, max } = Math;

function many(n, f) {
    return [...Array(n)].map((_, i) => f(i));
}

function rnd(x = 1, dx = 0) {
    return Math.random() * x + dx;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function pt(x, y) {
    return { x, y };
}

function noise(x, y, t = 101) {
    let w0 = sin(
        0.3 * x + 1.4 * t + 2 +
        2.5 * sin(0.4 * y - 1.3 * t + 1)
    );

    let w1 = sin(
        0.2 * y + 1.5 * t + 2.8 +
        2.3 * sin(0.5 * x - 1.2 * t + 0.5)
    );

    return w0 + w1;
}

function drawCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI * 2);
    ctx.fill();
}

function drawLine(x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);

    many(100, (i) => {
        i = (i + 1) / 100;

        let x = lerp(x0, x1, i);
        let y = lerp(y0, y1, i);

        let k = noise(x / 5 + x0, y / 5 + y0) * 2;

        ctx.lineTo(x + k, y + k);
    });

    ctx.stroke();
}

function spawn() {

    const pts = many(333, () => ({
        x: rnd(innerWidth),
        y: rnd(innerHeight),
        len: 0,
        r: 0
    }));

    const pts2 = many(9, (i) => ({
        x: cos((i / 9) * PI * 2),
        y: sin((i / 9) * PI * 2)
    }));

    let seed = rnd(100);
    let tx = rnd(innerWidth);
    let ty = rnd(innerHeight);

    let x = rnd(innerWidth);
    let y = rnd(innerHeight);

    let walkRadius = pt(50, 50);

    let kx = 0.5;
    let ky = 0.5;

    let r = innerWidth / rnd(100, 150);

    function paintPt(p) {

        pts2.forEach((p2) => {

            if (!p.len) return;

            drawLine(
                lerp(x + p2.x * r, p.x, p.len * p.len),
                lerp(y + p2.y * r, p.y, p.len * p.len),
                x + p2.x * r,
                y + p2.y * r
            );
        });

        drawCircle(p.x, p.y, p.r);
    }

    return {

        follow(nx, ny) {
            tx = nx;
            ty = ny;
        },

        tick(t) {

            const selfMoveX = cos(t * kx + seed) * walkRadius.x;
            const selfMoveY = sin(t * ky + seed) * walkRadius.y;

            let fx = tx + selfMoveX;
            let fy = ty + selfMoveY;

            x += min(innerWidth / 100, (fx - x) / 10);
            y += min(innerWidth / 100, (fy - y) / 10);

            let i = 0;

            pts.forEach((p) => {

                const dx = p.x - x;
                const dy = p.y - y;

                const len = hypot(dx, dy);

                let rr = min(2, innerWidth / len / 5);

                const increasing =
                    len < innerWidth / 10 &&
                    (i++) < 8;

                let dir = increasing ? 0.1 : -0.1;

                if (increasing) rr *= 1.5;

                p.r = rr;
                p.len = max(0, min(p.len + dir, 1));

                paintPt(p);
            });
        }
    };
}

const spiders = many(2, spawn);

window.addEventListener("pointermove", (e) => {

    spiders.forEach(spider => {
        spider.follow(e.clientX, e.clientY);
    });

});

function animate(t) {

    if (w !== innerWidth) {
        w = canvas.width = innerWidth;
    }

    if (h !== innerHeight) {
        h = canvas.height = innerHeight;
    }

    ctx.fillStyle = "#000";
    drawCircle(0, 0, w * 10);

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";

    spiders.forEach(spider => {
        spider.tick(t / 1000);
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
