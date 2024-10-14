export default async function scale(img, width, height) {
    let i = await createImageBitmap(img);
    let sw = i.width
    let sh = i.height
    let scale = Math.min(width / sw, height / sh)
    if (scale > 1) scale = 1;
    const canvas = document.createElement('canvas');
    canvas.width = sw * scale;
    canvas.height = sh * scale;
    canvas.getContext("2d").scale(scale, scale)
    let ctx = canvas.getContext('bitmaprenderer');
    if(ctx) {
        // transfer the ImageBitmap to it
        ctx.transferFromImageBitmap(img);
    }
    else {
        // in case someone supports createImageBitmap only
        // twice in memory...
        canvas.getContext('2d').drawImage(img,0,0);
    }
    canvas.getContext("2d").drawImage(i, 0, 0, sw, sh);
    return new Promise((res, rej) => canvas.toBlob(res));
}
