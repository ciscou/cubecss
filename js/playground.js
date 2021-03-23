(function() {
  var form = document.querySelector("form.playground");
  var iframeHTMLContainer = document.querySelector(".iframe-html-container");
  var iframeContainer = document.querySelector(".iframe-container");

  var refreshIframe = function() {
    var width = form.querySelector("input[name=width]").value;
    var height = form.querySelector("input[name=height]").value;

    var cubieSize = form.querySelector("input[name=cs]").value;
    var cubieSizeParam = cubieSize && `cs=${cubieSize}`

    var preseq = form.querySelector("input[name=preseq]").value.replaceAll(/\s+/g, ",").replaceAll("'", "i");
    var seq = form.querySelector("input[name=seq]").value.replaceAll(/\s+/g, ",").replaceAll("'", "i");
    var preseqParam = preseq && `preseq=${encodeURIComponent(preseq)}`;
    var seqParam = seq && `seq=${seq}`;

    var clru = form.querySelector("input[name=clru]").value;
    var clrd = form.querySelector("input[name=clrd]").value;
    var clrr = form.querySelector("input[name=clrr]").value;
    var clrl = form.querySelector("input[name=clrl]").value;
    var clrf = form.querySelector("input[name=clrf]").value;
    var clrb = form.querySelector("input[name=clrb]").value;
    var clrx = form.querySelector("input[name=clrx]").value;
    var clrp = form.querySelector("input[name=clrp]").value;

    var clruParam = clru && `clru=${encodeURIComponent(clru)}`;
    var clrdParam = clrd && `clrd=${encodeURIComponent(clrd)}`;
    var clrrParam = clrr && `clrr=${encodeURIComponent(clrr)}`;
    var clrlParam = clrl && `clrl=${encodeURIComponent(clrl)}`;
    var clrfParam = clrf && `clrf=${encodeURIComponent(clrf)}`;
    var clrbParam = clrb && `clrb=${encodeURIComponent(clrb)}`;
    var clrxParam = clrx && `clrx=${encodeURIComponent(clrx)}`;
    var clrpParam = clrp && `clrp=${encodeURIComponent(clrp)}`;

    var rx = form.querySelector("input[name=rx]").value;
    var ry = form.querySelector("input[name=ry]").value;
    var rz = form.querySelector("input[name=rz]").value;

    var rxParam = rx && `rx=${encodeURIComponent(rx)}`;
    var ryParam = ry && `ry=${encodeURIComponent(ry)}`;
    var rzParam = rz && `rz=${encodeURIComponent(rz)}`;

    var transition = form.querySelector("input[name=transition]").value;
    var perspective = form.querySelector("input[name=perspective]").value;

    var transitionParam = transition && `transition=${encodeURIComponent(transition)}`;
    var perspectiveParam = perspective && `perspective=${encodeURIComponent(perspective)}`;

    var stickerless = [];

    if(form.querySelector("input[name=stickerless_ulbu]").checked) stickerless.push("ULBU");
    if(form.querySelector("input[name=stickerless_ulbl]").checked) stickerless.push("ULBL");
    if(form.querySelector("input[name=stickerless_ulbb]").checked) stickerless.push("ULBB");
    if(form.querySelector("input[name=stickerless_urbu]").checked) stickerless.push("URBU");
    if(form.querySelector("input[name=stickerless_urbr]").checked) stickerless.push("URBR");
    if(form.querySelector("input[name=stickerless_urbb]").checked) stickerless.push("URBB");
    if(form.querySelector("input[name=stickerless_ulfu]").checked) stickerless.push("ULFU");
    if(form.querySelector("input[name=stickerless_ulfl]").checked) stickerless.push("ULFL");
    if(form.querySelector("input[name=stickerless_ulff]").checked) stickerless.push("ULFF");
    if(form.querySelector("input[name=stickerless_urfu]").checked) stickerless.push("URFU");
    if(form.querySelector("input[name=stickerless_urfr]").checked) stickerless.push("URFR");
    if(form.querySelector("input[name=stickerless_urff]").checked) stickerless.push("URFF");
    if(form.querySelector("input[name=stickerless_dlbd]").checked) stickerless.push("DLBD");
    if(form.querySelector("input[name=stickerless_dlbl]").checked) stickerless.push("DLBL");
    if(form.querySelector("input[name=stickerless_dlbb]").checked) stickerless.push("DLBB");
    if(form.querySelector("input[name=stickerless_drbd]").checked) stickerless.push("DRBD");
    if(form.querySelector("input[name=stickerless_drbr]").checked) stickerless.push("DRBR");
    if(form.querySelector("input[name=stickerless_drbb]").checked) stickerless.push("DRBB");
    if(form.querySelector("input[name=stickerless_dlfd]").checked) stickerless.push("DLFD");
    if(form.querySelector("input[name=stickerless_dlfl]").checked) stickerless.push("DLFL");
    if(form.querySelector("input[name=stickerless_dlff]").checked) stickerless.push("DLFF");
    if(form.querySelector("input[name=stickerless_drfd]").checked) stickerless.push("DRFD");
    if(form.querySelector("input[name=stickerless_drfr]").checked) stickerless.push("DRFR");
    if(form.querySelector("input[name=stickerless_drff]").checked) stickerless.push("DRFF");

    if(form.querySelector("input[name=stickerless_ubu]").checked) stickerless.push("UBU");
    if(form.querySelector("input[name=stickerless_ubb]").checked) stickerless.push("UBB");
    if(form.querySelector("input[name=stickerless_uru]").checked) stickerless.push("URU");
    if(form.querySelector("input[name=stickerless_urr]").checked) stickerless.push("URR");
    if(form.querySelector("input[name=stickerless_ufu]").checked) stickerless.push("UFU");
    if(form.querySelector("input[name=stickerless_uff]").checked) stickerless.push("UFF");
    if(form.querySelector("input[name=stickerless_ulu]").checked) stickerless.push("ULU");
    if(form.querySelector("input[name=stickerless_ull]").checked) stickerless.push("ULL");
    if(form.querySelector("input[name=stickerless_dbd]").checked) stickerless.push("DBD");
    if(form.querySelector("input[name=stickerless_dbb]").checked) stickerless.push("DBB");
    if(form.querySelector("input[name=stickerless_drd]").checked) stickerless.push("DRD");
    if(form.querySelector("input[name=stickerless_drr]").checked) stickerless.push("DRR");
    if(form.querySelector("input[name=stickerless_dfd]").checked) stickerless.push("DFD");
    if(form.querySelector("input[name=stickerless_dff]").checked) stickerless.push("DFF");
    if(form.querySelector("input[name=stickerless_dld]").checked) stickerless.push("DLD");
    if(form.querySelector("input[name=stickerless_dll]").checked) stickerless.push("DLL");
    if(form.querySelector("input[name=stickerless_lbl]").checked) stickerless.push("LBL");
    if(form.querySelector("input[name=stickerless_lbb]").checked) stickerless.push("LBB");
    if(form.querySelector("input[name=stickerless_rbr]").checked) stickerless.push("RBR");
    if(form.querySelector("input[name=stickerless_rbb]").checked) stickerless.push("RBB");
    if(form.querySelector("input[name=stickerless_rfr]").checked) stickerless.push("RFR");
    if(form.querySelector("input[name=stickerless_rff]").checked) stickerless.push("RFF");
    if(form.querySelector("input[name=stickerless_lfl]").checked) stickerless.push("LFL");
    if(form.querySelector("input[name=stickerless_lff]").checked) stickerless.push("LFF");

    if(form.querySelector("input[name=stickerless_u]").checked) stickerless.push("U");
    if(form.querySelector("input[name=stickerless_r]").checked) stickerless.push("R");
    if(form.querySelector("input[name=stickerless_f]").checked) stickerless.push("F");
    if(form.querySelector("input[name=stickerless_d]").checked) stickerless.push("D");
    if(form.querySelector("input[name=stickerless_l]").checked) stickerless.push("L");
    if(form.querySelector("input[name=stickerless_b]").checked) stickerless.push("B");

    var stickerlessParam = "";
    if(stickerless.length > 0) {
      stickerlessParam = "stickerless=" + encodeURIComponent(stickerless.join(","));
    }

    var params = [];
    if(cubieSizeParam) params.push(cubieSizeParam);
    if(preseqParam) params.push(preseqParam);
    if(seqParam) params.push(seqParam);
    if(clruParam) params.push(clruParam);
    if(clrdParam) params.push(clrdParam);
    if(clrrParam) params.push(clrrParam);
    if(clrlParam) params.push(clrlParam);
    if(clrfParam) params.push(clrfParam);
    if(clrbParam) params.push(clrbParam);
    if(clrxParam) params.push(clrxParam);
    if(clrpParam) params.push(clrpParam);
    if(rxParam) params.push(rxParam);
    if(ryParam) params.push(ryParam);
    if(rzParam) params.push(rzParam);
    if(transitionParam) params.push(transitionParam);
    if(perspectiveParam) params.push(perspectiveParam);
    if(stickerlessParam) params.push(stickerlessParam);

    var iframeHTML = `<iframe src="${window.location.origin}/cubecss/iframe.html${(params.length > 0) ? ("?" + params.join("&")) : ""}" width="${width}" height="${height}" frameborder="0"></iframe>`;

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
