(function (g, e, n, es, ys) {
  g["_genesysJs"] = e;
  g[e] =
    g[e] ||
    function () {
      (g[e].q = g[e].q || []).push(arguments);
    };
  g[e].t = 1 * new Date();
  g[e].c = es;
  ys = document.createElement("script");
  ys.async = 1;
  ys.src = n;
  ys.charset = "utf-8";
  document.head.appendChild(ys);
})(
  window,
  "Genesys",
  "https://apps.usw2.pure.cloud/genesys-bootstrap/genesys.min.js",
  {
    environment: "prod-usw2",
    deploymentId: "9b233f63-c0d1-4ade-84d0-91d75f7b1413",
    debug: true
  }
);

// Genesys("subscribe", "Journey.qualifiedWebMessagingOffer", ({ data }) => {
//     console.log("Received qualified web messaging offer:", data);
// });

// Genesys("subscribe", "Engage.inviteOffered", ({data})=>{
//   console.log("Received engage invite offered:", data);
// });