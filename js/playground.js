(function() {
  var form = document.querySelector("form.playground");
  var iframeHTMLContainer = document.querySelector(".iframe-html-container");
  var iframeContainer = document.querySelector(".iframe-container");

  var refreshIframe = function() {
    var width = form.querySelector("input[name=width]").value;
    var height = form.querySelector("input[name=height]").value;

    var preseq = form.querySelector("input[name=preseq]").value.replaceAll(/\s+/g, ",").replaceAll("'", "i");
    var seq = form.querySelector("input[name=seq]").value.replaceAll(/\s+/g, ",").replaceAll("'", "i");
    var preseqParam = preseq && `preseq=${preseq}`;
    var seqParam = seq && `seq=${seq}`;

    var clru = form.querySelector("input[name=clru]").value;
    var clrd = form.querySelector("input[name=clrd]").value;
    var clrr = form.querySelector("input[name=clrr]").value;
    var clrl = form.querySelector("input[name=clrl]").value;
    var clrf = form.querySelector("input[name=clrf]").value;
    var clrb = form.querySelector("input[name=clrb]").value;

    var clruParam = clru && `clru=${clru}`;
    var clrdParam = clrd && `clrd=${clrd}`;
    var clrrParam = clrr && `clrr=${clrr}`;
    var clrlParam = clrl && `clrl=${clrl}`;
    var clrfParam = clrf && `clrf=${clrf}`;
    var clrbParam = clrb && `clrb=${clrb}`;

    var stickerless = [];
    if(form.querySelector("input[name=stickerless_ulb]").checked) stickerless.push("ULB");
    if(form.querySelector("input[name=stickerless_urb]").checked) stickerless.push("URB");
    if(form.querySelector("input[name=stickerless_ulf]").checked) stickerless.push("ULF");
    if(form.querySelector("input[name=stickerless_urf]").checked) stickerless.push("URF");
    if(form.querySelector("input[name=stickerless_dlb]").checked) stickerless.push("DLB");
    if(form.querySelector("input[name=stickerless_drb]").checked) stickerless.push("DRB");
    if(form.querySelector("input[name=stickerless_dlf]").checked) stickerless.push("DLF");
    if(form.querySelector("input[name=stickerless_drf]").checked) stickerless.push("DRF");
    if(form.querySelector("input[name=stickerless_ub]").checked) stickerless.push("UB");
    if(form.querySelector("input[name=stickerless_ur]").checked) stickerless.push("UR");
    if(form.querySelector("input[name=stickerless_uf]").checked) stickerless.push("UF");
    if(form.querySelector("input[name=stickerless_ul]").checked) stickerless.push("UL");
    if(form.querySelector("input[name=stickerless_db]").checked) stickerless.push("DB");
    if(form.querySelector("input[name=stickerless_dr]").checked) stickerless.push("DR");
    if(form.querySelector("input[name=stickerless_df]").checked) stickerless.push("DF");
    if(form.querySelector("input[name=stickerless_dl]").checked) stickerless.push("DL");
    if(form.querySelector("input[name=stickerless_lb]").checked) stickerless.push("LB");
    if(form.querySelector("input[name=stickerless_rb]").checked) stickerless.push("RB");
    if(form.querySelector("input[name=stickerless_rf]").checked) stickerless.push("RF");
    if(form.querySelector("input[name=stickerless_lf]").checked) stickerless.push("LF");

    var stickerlessParam = "";
    if(stickerless.length > 0) {
      stickerlessParam = "stickerless=" + stickerless.join(",")
    }

    var params = [];
    if(preseqParam) params.push(preseqParam);
    if(seqParam) params.push(seqParam);
    if(clruParam) params.push(clruParam);
    if(clrdParam) params.push(clrdParam);
    if(clrrParam) params.push(clrrParam);
    if(clrlParam) params.push(clrlParam);
    if(clrfParam) params.push(clrfParam);
    if(clrbParam) params.push(clrbParam);
    if(stickerlessParam) params.push(stickerlessParam);

    var iframeHTML = `<iframe src="https://s3-eu-west-3.amazonaws.com/cubecss/iframe.html${(params.length > 0) ? ("?" + params.join("&")) : ""}" width="${width}" height="${height}" frameborder="0"></iframe>`;

    iframeHTMLContainer.innerText = iframeHTML;
    iframeContainer.innerHTML = iframeHTML;
  }

  form.querySelectorAll("input").forEach(function(input) {
    input.addEventListener("change", function() {
      refreshIframe();
    }, false);
  });

  refreshIframe();
})();
