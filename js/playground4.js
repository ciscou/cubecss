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

    if(form.querySelector("input[name=stickerless_ub1u]").checked) stickerless.push("UB1U");
    if(form.querySelector("input[name=stickerless_ub1b]").checked) stickerless.push("UB1B");
    if(form.querySelector("input[name=stickerless_ur1u]").checked) stickerless.push("UR1U");
    if(form.querySelector("input[name=stickerless_ur1r]").checked) stickerless.push("UR1R");
    if(form.querySelector("input[name=stickerless_uf1u]").checked) stickerless.push("UF1U");
    if(form.querySelector("input[name=stickerless_uf1f]").checked) stickerless.push("UF1F");
    if(form.querySelector("input[name=stickerless_ul1u]").checked) stickerless.push("UL1U");
    if(form.querySelector("input[name=stickerless_ul1l]").checked) stickerless.push("UL1L");
    if(form.querySelector("input[name=stickerless_db1d]").checked) stickerless.push("DB1D");
    if(form.querySelector("input[name=stickerless_db1b]").checked) stickerless.push("DB1B");
    if(form.querySelector("input[name=stickerless_dr1d]").checked) stickerless.push("DR1D");
    if(form.querySelector("input[name=stickerless_dr1r]").checked) stickerless.push("DR1R");
    if(form.querySelector("input[name=stickerless_df1d]").checked) stickerless.push("DF1D");
    if(form.querySelector("input[name=stickerless_df1f]").checked) stickerless.push("DF1F");
    if(form.querySelector("input[name=stickerless_dl1d]").checked) stickerless.push("DL1D");
    if(form.querySelector("input[name=stickerless_dl1l]").checked) stickerless.push("DL1L");
    if(form.querySelector("input[name=stickerless_lb1l]").checked) stickerless.push("LB1L");
    if(form.querySelector("input[name=stickerless_lb1b]").checked) stickerless.push("LB1B");
    if(form.querySelector("input[name=stickerless_rb1r]").checked) stickerless.push("RB1R");
    if(form.querySelector("input[name=stickerless_rb1b]").checked) stickerless.push("RB1B");
    if(form.querySelector("input[name=stickerless_rf1r]").checked) stickerless.push("RF1R");
    if(form.querySelector("input[name=stickerless_rf1f]").checked) stickerless.push("RF1F");
    if(form.querySelector("input[name=stickerless_lf1l]").checked) stickerless.push("LF1L");
    if(form.querySelector("input[name=stickerless_lf1f]").checked) stickerless.push("LF1F");

    if(form.querySelector("input[name=stickerless_ub2u]").checked) stickerless.push("UB2U");
    if(form.querySelector("input[name=stickerless_ub2b]").checked) stickerless.push("UB2B");
    if(form.querySelector("input[name=stickerless_ur2u]").checked) stickerless.push("UR2U");
    if(form.querySelector("input[name=stickerless_ur2r]").checked) stickerless.push("UR2R");
    if(form.querySelector("input[name=stickerless_uf2u]").checked) stickerless.push("UF2U");
    if(form.querySelector("input[name=stickerless_uf2f]").checked) stickerless.push("UF2F");
    if(form.querySelector("input[name=stickerless_ul2u]").checked) stickerless.push("UL2U");
    if(form.querySelector("input[name=stickerless_ul2l]").checked) stickerless.push("UL2L");
    if(form.querySelector("input[name=stickerless_db2d]").checked) stickerless.push("DB2D");
    if(form.querySelector("input[name=stickerless_db2b]").checked) stickerless.push("DB2B");
    if(form.querySelector("input[name=stickerless_dr2d]").checked) stickerless.push("DR2D");
    if(form.querySelector("input[name=stickerless_dr2r]").checked) stickerless.push("DR2R");
    if(form.querySelector("input[name=stickerless_df2d]").checked) stickerless.push("DF2D");
    if(form.querySelector("input[name=stickerless_df2f]").checked) stickerless.push("DF2F");
    if(form.querySelector("input[name=stickerless_dl2d]").checked) stickerless.push("DL2D");
    if(form.querySelector("input[name=stickerless_dl2l]").checked) stickerless.push("DL2L");
    if(form.querySelector("input[name=stickerless_lb2l]").checked) stickerless.push("LB2L");
    if(form.querySelector("input[name=stickerless_lb2b]").checked) stickerless.push("LB2B");
    if(form.querySelector("input[name=stickerless_rb2r]").checked) stickerless.push("RB2R");
    if(form.querySelector("input[name=stickerless_rb2b]").checked) stickerless.push("RB2B");
    if(form.querySelector("input[name=stickerless_rf2r]").checked) stickerless.push("RF2R");
    if(form.querySelector("input[name=stickerless_rf2f]").checked) stickerless.push("RF2F");
    if(form.querySelector("input[name=stickerless_lf2l]").checked) stickerless.push("LF2L");
    if(form.querySelector("input[name=stickerless_lf2f]").checked) stickerless.push("LF2F");

    if(form.querySelector("input[name=stickerless_u1]").checked) stickerless.push("U1");
    if(form.querySelector("input[name=stickerless_r1]").checked) stickerless.push("R1");
    if(form.querySelector("input[name=stickerless_f1]").checked) stickerless.push("F1");
    if(form.querySelector("input[name=stickerless_d1]").checked) stickerless.push("D1");
    if(form.querySelector("input[name=stickerless_l1]").checked) stickerless.push("L1");
    if(form.querySelector("input[name=stickerless_b1]").checked) stickerless.push("B1");
    if(form.querySelector("input[name=stickerless_u2]").checked) stickerless.push("U2");
    if(form.querySelector("input[name=stickerless_r2]").checked) stickerless.push("R2");
    if(form.querySelector("input[name=stickerless_f2]").checked) stickerless.push("F2");
    if(form.querySelector("input[name=stickerless_d2]").checked) stickerless.push("D2");
    if(form.querySelector("input[name=stickerless_l2]").checked) stickerless.push("L2");
    if(form.querySelector("input[name=stickerless_b2]").checked) stickerless.push("B2");
    if(form.querySelector("input[name=stickerless_u3]").checked) stickerless.push("U3");
    if(form.querySelector("input[name=stickerless_r3]").checked) stickerless.push("R3");
    if(form.querySelector("input[name=stickerless_f3]").checked) stickerless.push("F3");
    if(form.querySelector("input[name=stickerless_d3]").checked) stickerless.push("D3");
    if(form.querySelector("input[name=stickerless_l3]").checked) stickerless.push("L3");
    if(form.querySelector("input[name=stickerless_b3]").checked) stickerless.push("B3");
    if(form.querySelector("input[name=stickerless_u4]").checked) stickerless.push("U4");
    if(form.querySelector("input[name=stickerless_r4]").checked) stickerless.push("R4");
    if(form.querySelector("input[name=stickerless_f4]").checked) stickerless.push("F4");
    if(form.querySelector("input[name=stickerless_d4]").checked) stickerless.push("D4");
    if(form.querySelector("input[name=stickerless_l4]").checked) stickerless.push("L4");
    if(form.querySelector("input[name=stickerless_b4]").checked) stickerless.push("B4");

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

    var iframeHTML = `<iframe src="${window.location.origin}/cubecss/iframe4.html${(params.length > 0) ? ("?" + params.join("&")) : ""}" width="${width}" height="${height}" frameborder="0"></iframe>`;

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
