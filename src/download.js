export default function (content,opts){
  content = content.constructor === Blob? content:[content];
  const blob = new Blob(content, Object.assign({ type: "text/plain" }, opts));
  const url = URL.createObjectURL(blob); // 创建一个 Blob URL
  const a = document.createElement("a");
  a.href = url;
  a.download = "test.txt";
  a.click();
  URL.revokeObjectURL(url);
}
