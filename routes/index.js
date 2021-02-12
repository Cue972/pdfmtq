var express = require("express");
var router = express.Router();
var PdfPrinter = require("pdfmake/src/printer");
var fonts = {
  Roboto: {
    normal: "./fonts/Roboto-Regular.ttf",
    bold: "./fonts/Roboto-Medium.ttf",
    italics: "./fonts/Roboto-Italic.ttf",
    bolditalics: "./fonts/Roboto-MediumItalic.ttf",
  },
  FontAwesome: {
    normal: "./fonts/fa-regular-400.ttf",
    bold: "./fonts/fa-regular-400.ttf",
    italics: "./fonts/fa-regular-400.ttf",
    bolditalics: "./fonts/fa-regular-400.ttf",
  },
};

function NouvelleLigne(num, description) {
  let ligne = [
    {
      text: num,
      style: "tableTxt",
      border: [true, false, true, true],
    },
    {
      text: description,
      border: [true, false, true, true],
      style: "tableTxt9",
    },
    {
      canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
      //text: "",
      border: [true, false, true, true],
    },
    {
      canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
      //text: "",
      border: [true, false, true, true],
    },
    {
      canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
      //text: "",
      border: [true, false, true, true],
    },
    { text: "", border: [true, false, true, true] },
    {
      canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
      //text: "",
      border: [true, false, true, true],
    },
    { text: "", border: [true, false, true, true] },
    {
      canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
      //text: "",
      border: [true, false, true, true],
    },
    {
      //text: "",
      canvas: [{ type: "rect", x: 7, y: 0, w: 8.7, h: 8.7 }],
      border: [true, false, true, true],
    },
  ];
  return ligne;
}

// Création nouveau sous-titre de tableau
function NouveauSousTitre(description) {
  let ligne = [
    {
      text: description,
      colSpan: 10,
      border: [true, false, true, false],
      style: "tableHeader",
      fillColor: "#f2f2f2",
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ];
  return ligne;
}

// Format bordure des tableaux
let my_layout = {
  // Permet de réduire la taille des bordures des tableaux, formules compliqué mais ca ne marche pas sinon

  hLineWidth: function (i, node) {
    return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
  },
  vLineWidth: function (i, node) {
    return i === 0 || i === node.table.widths.length ? 0.5 : 0.5;
  },
  hLineColor: "#808080",
  vLineColor: "#808080",
};

let docDefinition = {
  // a string or { width: number, height: number }
  pageSize: "LEGAL",

  // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
  pageMargins: [36.4, 25, 36.4, 25],

  content: [
    {
      columns: [
        {
          width: 140,
          text: "Insérer Logo",
        },
        {
          table: {
            widths: [386],
            body: [
              [
                {
                  text: "Inspection de signalisation                       ",
                  style: "header",
                  fillColor: "#cccccc",
                  border: [false, false, false, false],
                },
              ],
            ],
          },
        },
      ],
    },

    "\n",
    {
      table: {
        widths: [178, 73, 89, 162],
        body: [
          [
            {
              text: "Numéro de dossier Ministère - Entrepreneur",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {
              text: "Numéro de projet",
              colSpan: 2,
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {
              text: "Entrepreneur ",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
          ],
          [
            { text: "", border: [true, false, true, true] },
            { text: " ", colSpan: 2, border: [true, false, true, true] },
            {},
            { text: " ", border: [true, false, true, true] },
          ],
          [
            {
              text: "Localisation (entrave)",
              style: "tableHeader",
              colSpan: 3,
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {},
            {
              text: "Surveillant",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
          ],
          [
            { text: " ", colSpan: 3, border: [true, false, true, true] },
            {},
            {},
            { text: " ", border: [true, false, true, true] },
          ],
          [
            {
              text: "Réseau",
              style: "tableHeader",
              colSpan: 3,
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {},
            {
              text: "Responsable en signalisation du surveillant",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
          ],
          [
            {
              text: " Ministère                     Municipalité",
              margin: [13, 2],
              style: "tableTxt",
              colSpan: 3,
              border: [true, false, true, true],
            },
            {},
            {},
            { text: " ", border: [true, false, true, true] },
          ],
          [
            {
              text:
                "Types de travaux \t\t\t  Courte durée < 24h \t\t\t Longue durée > 24 h \n Chantier ciblé pour la surveillance policière \t\t\t\t Non \t\t    Oui ",
              colSpan: 2,
              style: "tableTxt",
            },
            {},
            {
              text:
                "\t Inspection de l’installation initiale \t\t\t\t Changement de phase\n Autre modification \t\t Inspection de nuit \t\t\tInspection quotidienne ",
              colSpan: 2,
              style: "tableTxt",
            },
            {},
          ],
        ],
      },
      layout: my_layout,
    },

    {
      canvas: [
        {
          type: "rect",
          x: 5,
          y: -39,
          w: 8.7,
          h: 8.7,
        },
        {
          type: "rect",
          x: 80,
          y: -39,
          w: 8.7,
          h: 8.7,
        },
        {
          type: "rect",
          x: 80,
          y: -21,
          w: 8.7,
          h: 8.7,
        },
        {
          type: "rect",
          x: 178,
          y: -21,
          w: 8.7,
          h: 8.7,
        },
        {
          type: "rect",
          x: 180,
          y: -11,
          w: 8.7,
          h: 8.7,
        },
        {
          type: "rect",
          x: 220,
          y: -12,
          w: 8.7,
          h: 8.7,
        },
      ],
    },

    {
      margin: [0, 5, 0, 0],
      table: {
        widths: [9, 163, 14, 14, 14, 155, 14, 31, 15, 22],
        body: [
          [
            {
              text: "Vérifications réalisées",
              alignment: "center",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Conformité",
              alignment: "center",
              colSpan: 3,
              style: "tableHeader",
              fillColor: "#bfbfbf",
            },
            {},
            {},
            {
              text: "Remarques ",
              alignment: "center",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              rowSpan: 2,
              border: [true, true, true, false],
            },
            {
              text: "Avis à l'entrepreneur",
              alignment: "center",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Corrections",
              alignment: "center",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
          ],
          [
            {
              text: "Aménagement de la zone des travaux",
              style: "tableHeader",
              fillColor: "#f2f2f2",
              colSpan: 2,
              border: [true, true, true, false],
            },
            {},
            {
              text: "C",
              style: "tableHeader",
              alignment: "center",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {
              text: "NC",
              alignment: "center",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {
              text: "S.O.",
              alignment: "center",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {
              text: "Oral",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
            },
            {
              text: "Numéro",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
            },
            {
              text: "C",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
            },
            {
              text: "NC/NR",
              style: "tableHeader",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
            },
          ],
          // [
          //   {
          //     text: "1",
          //     style: "tableHeader",
          //     border: [true, false, true, true]
          //   },
          //   {
          //     text: "Aménagement selon les DN, plans et devis",
          //     border: [true, false, true, true],
          //     style: "tableTxt"
          //   },
          //   {
          //     canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
          //     border: [true, false, true, true]
          //   },
          //   {
          //     canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
          //     border: [true, false, true, true]
          //   },
          //   {
          //     canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
          //     border: [true, false, true, true]
          //   },
          //   { text: "", border: [true, false, true, true] },
          //   {
          //     canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
          //     border: [true, false, true, true]
          //   },
          //   { text: "", border: [true, false, true, true] },
          //   {
          //     canvas: [{ type: "rect", x: 2, y: 0, w: 8.7, h: 8.7 }],
          //     border: [true, false, true, true]
          //   },
          //   {
          //     canvas: [{ type: "rect", x: 7, y: 0, w: 8.7, h: 8.7 }],
          //     border: [true, false, true, true]
          //   }
          // ],
          // [nouvelleLigne("num", "description")]
          NouvelleLigne("1", "Aménagement selon les DN, plans et devis"),
          NouvelleLigne("2", "Longueur et configuration du biseau L"),
          NouvelleLigne("3", "Largeur des voies de circulation"),
          NouveauSousTitre("PMV mobiles"),
          NouvelleLigne("4", "Distance minimale de visibilité (> 250 m) "),
          NouvelleLigne("5", "Distance de lisibilité (de 60 à 165 m)"),
          NouvelleLigne("6", "Affichage (luminosité, fonctionnement, etc.)"),
          NouvelleLigne(
            "7",
            "Contenu de message (fautes, texte et pictogramme normalisés, correspondance avec la situation réelle)"
          ),
          NouvelleLigne(
            "8",
            "Installation (fig. 8.16-1 : repères visuels, distance d’éloignement p/r à la ligne de rive de 1 m au min.)"
          ),
          NouvelleLigne("9", "Inspection de nuit (luminosité)"),
          NouveauSousTitre("Panneaux"),
          NouvelleLigne("10", "Travaux annoncés à l’avance 5 4 3 2 1km"),
          NouvelleLigne("11", "Panneaux d’aluminium"),
          NouvelleLigne(
            "12",
            "Types de pellicules : Type III : Blanc Type VII ou VIII : Orange Type III (pour indication temporaire)"
          ),
          NouvelleLigne("13", "Dimensions des panneaux (tableau 1.9-1)"),

          NouvelleLigne(
            "14",
            "Lettrage, textes, pictogrammes conformes au Tome V"
          ),
          NouvelleLigne("15", "Rétroréflexion (> 50%)"),
          NouvelleLigne(
            "16",
            "Distance minimale de visibilité (tableau 4.3.-1)"
          ),
          NouvelleLigne("17", "État des panneaux (panneaux endommagés, sales)"),
          NouvelleLigne(
            "18",
            "Installation (stabilité, verticalité, un panneau par support)"
          ),
          NouvelleLigne(
            "19",
            "Hauteur d’installation p/r à la ligne de rive (fig. 1.13-1)"
          ),
          NouvelleLigne(
            "20",
            "Distance d’éloignement p/r à la ligne de rive (0 à 3,5 m)"
          ),
          NouvelleLigne("21", "Support (rigide, stable, une pièce unique)"),
          NouvelleLigne("22", "Lestage (lests conformes, hauteur)"),
          NouvelleLigne("23", "Espacement B"),
          NouvelleLigne(
            "24",
            "Masquage des panneaux (opaque, fixé solidement, selon la norme"
          ),
          NouvelleLigne("25", "Masquage correspond à la situation réelle"),
          NouvelleLigne("26", "Cohérence des panneaux et des masques"),
          NouvelleLigne(
            "27",
            "Information concernant les camions correspond à la situation réelle (largeur de voie, hauteur libre, poids, etc.)"
          ),
          NouvelleLigne(
            "28",
            "Vitesse temporaire affichée 50 70 80 90Copies signées reçues V-3044 V-3046"
          ),
          NouvelleLigne(
            "29",
            "Localisation de panneaux T-70-1 « Limite de vitesse » dans la séquence des panneaux"
          ),
          NouvelleLigne(
            "30",
            "Localisation T-70-2 « Signal avancé de limite de vitesse » (tableau 4-16.1)"
          ),
          NouvelleLigne("31", "Panneaux « Fin » (présence, localisation)"),
          NouvelleLigne(
            "32",
            "Inspection de nuit (orientation des panneaux, éblouissement, masquage)"
          ),
        ],
      },

      layout: my_layout,
    },
  ], // End comtent

  styles: {
    header: {
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 10],
      //font: Courier,
    },
    tableHeader: {
      bold: true,
      fontSize: 8,
      color: "black",
    },
    tableTxt: {
      fontSize: 8,
      color: "black",
    },
    tableHeader7: {
      bold: true,
      fontSize: 7,
      color: "black",
    },
    tableTxt7: {
      fontSize: 7,
      color: "black",
    },
    tableTxt9: {
      fontSize: 9,
      color: "black",
    },
    tableExample: {
      margin: [0, 5, 0, 15],
    },
    icon: {
      font: "FontAwesome",
    },
  },
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  var pdf = await generatePDF(docDefinition);
  res.contentType("application/pdf");
  res.send(pdf);
  //res.render('index', { title: 'Express' });
});

function generatePDF(dd) {
  var printer = new PdfPrinter(fonts);
  const doc = printer.createPdfKitDocument(dd);

  let chunks = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });
  doc.end();
  return new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  //return res.send('OK');
}

module.exports = router;
