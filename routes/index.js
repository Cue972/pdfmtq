var express = require("express");
const { FailedDependency } = require("http-errors");
var router = express.Router();
var PdfPrinter = require("pdfmake/src/printer");
var fonts = {
  FontAwesome: {
    normal: "./fonts/fa-regular-400.ttf",
    bold: "./fonts/fa-regular-400.ttf",
    italics: "./fonts/fa-regular-400.ttf",
    bolditalics: "./fonts/fa-regular-400.ttf",
  },
  ArialNarrow: {
    normal: "./fonts/ArialNarrow2.ttf",
    bold: "./fonts/ArialNarrowBold.ttf",
    italics: "./fonts/ArialNarrowItalic.ttf",
    bolditalics: "./fonts/ArialNarrowBoldItalic.ttf",
  },
  ArialMT: {
    normal: "./fonts/ArialMT.ttf",
    bold: "./fonts/Arial-BoldMT.otf",
    italics: "./fonts/ArialMT.ttf",
    bolditalics: "./fonts/ArialMT.ttf",
  },
};

function NouvelleLigne(num, description) {
  let ligne = [
    {
      text: num,
      alignment: "center",
      style: "tableTxtMT8",
      margin: [-1, 0, 0, 0],
      border: [true, false, true, true],
    },
    {
      text: description,
      lineHeight: 1,
      margin: [2, 0, 0, 0],
      border: [true, false, true, true],
      style: "tableTxtN9",
    },
    {
      text: mySquare(9),
      alignment: "center",
      border: [true, false, true, true],
    },
    {
      text: mySquare(9),
      alignment: "center",
      border: [true, false, true, true],
    },
    {
      text: mySquare(9),
      alignment: "center",
      border: [true, false, true, true],
    },
    { text: "", border: [true, false, true, true] },
    {
      text: mySquare(9),
      alignment: "center",
      border: [true, false, true, true],
    },
    { text: "", border: [true, false, true, true] },
    {
      text: mySquare(9),
      alignment: "center",
      border: [true, false, true, true],
    },
    {
      text: mySquare(9),
      alignment: "center",
      border: [true, false, true, true],
    },
  ];
  return ligne;
}

function NouveauSousTitre(description) {
  let ligne = [
    {
      text: description,
      colSpan: 10,
      lineHeight: 0.65,
      margin: [2, -3, 0, 0],
      border: [true, false, true, false],
      style: "tableHeaderMT8",
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

//Renvoie un carré vide
function mySquare(taille) {
  let carre = {
    text: "",
    style: "icon ",
    font: "FontAwesome",
    fontSize: taille,
  };
  return carre;
}

// Format des tableaux
let my_layoutIntro = {
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

let my_layoutBanner = {
  hLineWidth: function (i, node) {
    return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
  },
  vLineWidth: function (i, node) {
    return i === 0 || i === node.table.widths.length ? 0.5 : 0.5;
  },
  hLineColor: "#808080",
  vLineColor: "#808080",

  paddingLeft: function (i, node) {
    return 1;
  },
  paddingRight: function (i, node) {
    return 1;
  },
};

let my_layoutTable = {
  hLineWidth: function (i, node) {
    return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
  },
  vLineWidth: function (i, node) {
    return i === 0 || i === node.table.widths.length ? 0.5 : 0.5;
  },
  hLineColor: "#808080",
  vLineColor: "#808080",

  paddingLeft: function (i, node) {
    return 1;
  },
  paddingRight: function (i, node) {
    return 0;
  },
  paddingTop: function (i, node) {
    return 4;
  },
  paddingBottom: function (i, node) {
    return 4;
  },
};

let my_layoutDash = {
  hLineWidth: function (i, node) {
    return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
  },
  vLineWidth: function (i, node) {
    return i === 0 || i === node.table.widths.length ? 0.5 : 0.5;
  },
  hLineColor: function (i, node) {
    if (i === 0 || i === node.table.body.length) {
      return "#808080";
    }
    return "#000000";
  },

  vLineColor: "#808080",

  paddingLeft: function (i, node) {
    return 1;
  },
  paddingRight: function (i, node) {
    return -1;
  },
  paddingTop: function (i, node) {
    return 0.1;
  },
  paddingBottom: function (i, node) {
    return 0.1;
  },
  hLineStyle: function (i, node) {
    if (i === 0 || i === node.table.body.length) {
      return null;
    }
    return { dash: { length: 0.5, space: 0.5 } };
  },
};

let my_layoutRemarque = {
  hLineWidth: function (i, node) {
    return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
  },
  vLineWidth: function (i, node) {
    return i === 0 || i === node.table.widths.length ? 0.5 : 0.5;
  },
  hLineColor: "#808080",
  vLineColor: "#808080",

  paddingLeft: function (i, node) {
    return 3;
  },
  paddingRight: function (i, node) {
    return 3;
  },
  paddingTop: function (i, node) {
    return 4;
  },
  paddingBottom: function (i, node) {
    return 4;
  },
};

let docDefinition = {
  pageSize: "LEGAL",

  // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
  pageMargins: [34, 25, 34, 43],

  content: [
    {
      columns: [
        {
          image: "./fonts/Logo-TransportNB.jpg",
          width: 139,
          margin: [-13, -11, 0, 0],
        },
        {
          table: {
            widths: [392],
            body: [
              [
                {
                  text: "Inspection de signalisation      ",
                  style: "header",
                  lineHeight: 1.1,
                  margin: [2, 1, 0, 0],
                  fillColor: "#cccccc",
                  border: [false, false, false, false],
                },
              ],
            ],
          },
        },
      ],
    },

    {
      margin: [0, 13, 0, 0],
      table: {
        widths: [179, 74, 90, 164],
        body: [
          [
            {
              text: "Numéro de dossier Ministère - Entrepreneur",
              style: "tableHeaderN8",
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {
              text: "Numéro de projet",
              colSpan: 2,
              style: "tableHeaderN8",
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {
              text: "Entrepreneur ",
              style: "tableHeaderN8",
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
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
              style: "tableHeaderN8",
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
              colSpan: 3,
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {},
            {
              text: "Surveillant",
              style: "tableHeaderN8",
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
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
              style: "tableHeaderN8",
              colSpan: 3,
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
            {},
            {},
            {
              text: "Responsable en signalisation du surveillant",
              style: "tableHeaderN8",
              lineHeight: 0.8,
              margin: [0, -2, 0, 0],
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
            },
          ],
          [
            {
              text: [
                mySquare(11),
                "  Ministère \t\t    ",
                mySquare(11),
                "   Municipalité ",
              ],
              style: "tableTxtMT8",
              colSpan: 3,
              border: [true, false, true, true],
            },
            {},
            {},
            { text: " ", border: [true, false, true, true] },
          ],
          [
            {
              text: [
                "Types de travaux  \t ",
                mySquare(11),
                " Courte durée < 24h\t ",
                mySquare(11),
                " Longue durée > 24 h\nChantier ciblé pour la surveillance policière\t\t",
                mySquare(11),
                " Non\t  ",
                mySquare(11),
                " Oui",
              ],
              colSpan: 2,
              style: "tableTxtMT8",
            },
            {},
            {
              text: [
                mySquare(11),
                " Inspection de l’installation initiale\t\t\t\t ",
                mySquare(11),
                " Changement de phase\n",
                mySquare(11),
                " Autre modification    ",
                mySquare(11),
                " Inspection de nuit   ",
                mySquare(11),
                " Inspection quotidienne",
              ],
              colSpan: 2,
              style: "tableTxtMT8",
            },
            {},
          ],
        ],
      },
      layout: my_layoutIntro,
    },

    {
      margin: [0, 4, 0, 0],
      table: {
        widths: [8, 193, 15, 15, 15, 181, 15, 35, 16, 23],
        body: [
          [
            {
              text: "Vérifications réalisées",
              alignment: "center",
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Conformité",
              alignment: "center",
              colSpan: 3,
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
            },
            {},
            {},
            {
              text: "Remarques ",
              alignment: "center",
              margin: [0, 6, 0, 0],
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              rowSpan: 2,
              border: [true, true, true, false],
            },
            {
              text: "Avis à l'entrepreneur",
              alignment: "center",
              margin: [0, -3, 0, 0],
              lineHeight: 0.8,
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Corrections",
              alignment: "center",
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
          ],
          [
            {
              text: "Aménagement de la zone des travaux",
              style: "tableHeaderMT8",
              fillColor: "#f2f2f2",
              lineHeight: 0.7,
              margin: [3, -2, 0, 0],
              colSpan: 2,
              border: [true, true, true, false],
            },
            {},
            {
              text: "C",
              style: "tableTxtMT7",
              alignment: "center",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "NC",
              alignment: "center",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "S.O.",
              alignment: "center",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {},
            {
              text: "Oral",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "Numéro",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "C",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "NC/NR",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
          ],
        ],
      },

      layout: my_layoutBanner,
    },
    {
      table: {
        widths: [9, 194, 16, 16, 16, 182, 16, 36, 17, 24],
        body: [
          NouvelleLigne("1", "Aménagement selon les DN, plans et devis"),
          NouvelleLigne("2", [
            "Longueur et configuration du biseau\t\t\t\t\t\t",
            { text: "L", bold: true },
          ]),
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
          NouvelleLigne("10", [
            "Travaux annoncés à l’avance ",
            mySquare(9),
            " 5  ",
            mySquare(9),
            " 4  ",
            mySquare(9),
            " 3  ",
            mySquare(9),
            "2  ",
            mySquare(9),
            "1km",
          ]),
          NouvelleLigne("11", "Panneaux d’aluminium"),

          [
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "Types de pellicules :",
              margin: [2, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 0.2,
            },
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "",
              border: [true, false, true, false],
            },
            { text: "", border: [true, false, true, false] },
            {
              text: "",
              border: [true, false, true, false],
            },
            { text: "", border: [true, false, true, true], rowSpan: 4 }, // Remarques
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "",
              border: [true, false, true, false],
            },
          ],

          [
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "\t\tType III : Blanc",
              margin: [18, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 0.2,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            { text: "", border: [true, false, true, false] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {},
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
          ],

          [
            {
              text: "12",
              alignment: "center",
              style: "tableTxtMT8",
              margin: [-1, -5, 0, 0],
              border: [true, false, true, false],
              lineHeight: 0.2,
            },
            {
              text: "Type VII ou VIII : Orange",
              margin: [18, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 0.2,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            { text: "", border: [true, false, true, false] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {},
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, false],
              lineHeight: 0,
            },
          ],

          [
            {
              text: "",
              border: [true, false, true, true],
            },
            {
              text: "\t\tType III (pour indication temporaire)",
              margin: [18, 0, 0, 0],
              border: [true, false, true, true],
              style: "tableTxtN9",
              lineHeight: 0.8,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 0,
            },
            { text: "", border: [true, false, true, true], lineHeight: 0 },

            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 0,
            },
            {},
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 0,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 0,
            },
          ],

          NouvelleLigne("13", [
            "Dimensions des panneaux (tableau 1.9-1)\n",
            mySquare(9),
            "  600 mm   ",
            mySquare(9),
            "  750 mm   ",
            mySquare(9),
            "  900 mm  ",
            mySquare(9),
            "  1200 mm",
          ]),

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
          NouvelleLigne("23", [
            "Espacement\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t",
            { text: "B", bold: true },
          ]),
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
          NouvelleLigne("28", [
            "Vitesse temporaire affichée   ",
            mySquare(9),
            "  50  ",
            mySquare(9),
            "  70  ",
            mySquare(9),
            "  80  ",
            mySquare(9),
            "  90\nCopies signées reçues  ",
            mySquare(9),
            "  V-3044  ",
            mySquare(9),
            "  V-3046  ",
          ]),
          NouvelleLigne(
            "29",
            "Localisation de panneaux T-70-1 «Limite de vitesse» dans la séquence des panneaux"
          ),
          NouvelleLigne(
            "30",
            "Localisation T-70-2 « Signal avancé de limite de vitesse »\n(tableau 4-16.1)"
          ),
          NouvelleLigne("31", "Panneaux « Fin » (présence, localisation)"),
          NouvelleLigne(
            "32",
            "Inspection de nuit (orientation des panneaux, éblouissement, masquage)"
          ),
        ],
      },

      layout: my_layoutTable,
    },
    { text: "", pageBreak: "before" },

    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------  PAGE 2  --------------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//

    {
      table: {
        widths: [8, 193, 15, 15, 15, 181, 15, 35, 16, 23],
        pageBreak: "before",
        body: [
          [
            {
              text: "Vérifications réalisées",
              alignment: "center",
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              margin: [0, 6, 0, 0],
              border: [true, true, true, false],
              rowSpan: 2,
              colSpan: 2,
            },
            {},
            {
              text: "Conformité",
              alignment: "center",
              colSpan: 3,
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
            },
            {},
            {},
            {
              text: "Remarques ",
              alignment: "center",
              margin: [0, 6, 0, 0],
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              rowSpan: 2,
              border: [true, true, true, false],
            },
            {
              text: "Avis à l'entrepreneur",
              alignment: "center",
              margin: [0, -3, 0, 0],
              lineHeight: 0.8,
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Corrections",
              alignment: "center",
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
          ],
          [
            {},
            {},
            {
              text: "C",
              style: "tableTxtMT7",
              alignment: "center",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "NC",
              alignment: "center",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "S.O.",
              alignment: "center",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {},
            {
              text: "Oral",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "Numéro",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "C",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "NC/NR",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
          ],
        ],
      },

      layout: my_layoutBanner,
    },
    {
      table: {
        widths: [9, 194, 16, 16, 16, 182, 16, 36, 17, 24],
        body: [
          NouveauSousTitre([
            "Dispositifs de retenue : ",
            mySquare(9),
            " Glissières en béton pour chantier\t",
            mySquare(9),
            " Glissières semi-rigides",
          ]),

          NouvelleLigne(
            "33",
            "Glissières (état, installation, alignement, continuité,espace libre en arrière, avis de l’entrepreneur)"
          ),
        ],
      },

      layout: my_layoutTable,
    },

    {
      table: {
        widths: [10, 195, 17, 17, 17, 183, 17, 37, 18, 25],
        body: [
          [
            {
              text: "34",
              border: [true, false, true, true],
              margin: [-1, 40, 0, 0],
              rowSpan: 7,
            },
            {
              text: "Protection des origines de glissières ",
              margin: [1, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: " ",
              border: [true, false, true, false],
            },
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "",
              border: [true, false, true, false],
            },
            { text: "", border: [true, false, true, false] },
            {
              text: "",
              border: [true, false, true, false],
            },
            { text: "", border: [true, false, true, false] },
            {
              text: "",
              border: [true, false, true, false],
            },
            {
              text: "",
              border: [true, false, true, false],
            },
          ],

          //Atténuateur d’impact

          [
            {},
            {
              text: [
                mySquare(9),
                " Atténuateur d’impact (homologation,installation,visibilité avis de l’entrepreneur)",
              ],
              margin: [1, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: [mySquare(9), "\n "],
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 2, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 2, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 2, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 2, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 2, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 2, 0, 0],
            },
          ],

          //Déviation

          [
            {},
            {
              text: [mySquare(9), " Déviation (dégagement latéral)\n"],
              margin: [1, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 1.1,
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
          ],

          //Caché en arrière des glissières existantes

          [
            {},
            {
              text: [
                mySquare(9),
                " Caché en arrière des glissières existantes\n",
              ],
              margin: [1, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              lineHeight: 1,
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
          ],

          //Dispositifs d’extrémité de glissières semi-rigides

          [
            {},
            {
              text: [
                mySquare(9),
                " Dispositifs d’extrémité de glissières semi-rigides",
              ],
              margin: [1, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: "",
              border: [true, false, true, true],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
          ],

          //Unité effilée (état, installation)

          [
            {},
            {
              text: [
                "Jonction avec une glissière ou bordure :\n",
                mySquare(9),
                " Unité effilée (état, installation)",
              ],
              margin: [1, 0, 0, 0],
              border: [true, false, true, false],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 6, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 6, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 6, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 6, 0, 0],
            },
            { text: "", border: [true, false, true, true], lineHeight: 0 },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 6, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 6, 0, 0],
            },
          ],

          //Unité en « Y » (état, installation)

          [
            {},
            {
              text: [mySquare(9), " Unité en « Y » (état, installation)\n"],
              margin: [1, 0, 0, 0],
              border: [true, false, true, true],
              style: "tableTxtN9",
              lineHeight: 1,
            },
            {
              text: mySquare(9),
              alignment: "center",
              //border: [true, true, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true] },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            { text: "", border: [true, false, true, true], lineHeight: 0 },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
            {
              text: mySquare(9),
              alignment: "center",
              border: [true, false, true, true],
              margin: [-1, 1, 0, 0],
            },
          ],
        ],
      },

      layout: my_layoutDash,
    },

    {
      table: {
        widths: [9, 194, 16, 16, 16, 182, 16, 36, 17, 24],
        body: [
          NouvelleLigne("35", "Barils de sable"),
          NouvelleLigne(
            "36",
            "Minibalises et chevrons fixés sur glissières (état, espacement, fixation, visibilité)"
          ),
          NouvelleLigne(
            "37",
            "Solution antigel dans les atténuateurs d’impact lestés à l’eau pendant la période hivernale"
          ),
          NouvelleLigne(
            "38",
            "Plaques rétroréfléchisantes sur les poteaux des glissières semi-rigides lorsque la déviation est à contre-sens"
          ),
          NouvelleLigne(
            "39",
            "AIFV (homologation, état, installation, avis de l’entrepreneur)"
          ),
          NouveauSousTitre("Marquage temporaire de la chaussée et prémarquage"),
          NouvelleLigne("40", "Effacement"),
          NouvelleLigne("41", "Conforme aux plans de marquage"),
          NouvelleLigne("42", "Alignement"),
          NouvelleLigne("43", "Délinéateur de surfaces DTS (état, espacement)"),
          NouvelleLigne("44", "Prémarquage (rondelles)"),
          NouvelleLigne("45", "Inspection de nuit (visibilité)"),
          NouveauSousTitre([
            "Repères visuel  ",
            mySquare(9),
            "  T-RV- 7  ",
            mySquare(9),
            "  T-RV -",
          ]),
          NouvelleLigne("46", "Alignement"),
          NouvelleLigne("47", "Stabilité"),
          NouvelleLigne("48", [
            "Espacement\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t",
            { text: "E", bold: true },
          ]),
          NouvelleLigne("49", "Conformité (homologation, état)"),
          NouvelleLigne(
            "50",
            "Chevrons (dimensions, solidité, visibilité, hauteur)"
          ),
          NouvelleLigne(
            "51",
            "Barrière (conformité, matériel, installation, largeur de 80% de l’entrave)"
          ),
          NouvelleLigne(
            "52",
            "Autres repère (dimensions matériel, état, installation)"
          ),
          NouvelleLigne("53", "Inspection de nuit (éblouissement)"),
          NouveauSousTitre("Flèches de signalisation (tableau 4.37-1)"),
          NouvelleLigne("54", [
            "Dimensions ",
            mySquare(8),
            " 2400x1200 mm ",
            mySquare(8),
            " 1500x600 mm",
          ]),
          NouvelleLigne(
            "55",
            "Blocs optiques (dimensions, nombre, fonctionnement)"
          ),
          NouvelleLigne(
            "56",
            "Uniformité des blocs optiques (intensité, couleur)"
          ),
          NouvelleLigne("57", [
            "Hauteur minimale du sol ",
            mySquare(8),
            " 2100 mm ",
            mySquare(8),
            " 1500 mm",
          ]),
          NouvelleLigne("58", "Distance minimale de visibilité"),
          NouvelleLigne("59", [
            "Distance minimale de lisibilité ",
            mySquare(8),
            " 800 m ",
            mySquare(8),
            " 600 m",
          ]),
          NouvelleLigne("60", "Inspection de nuit (luminosité)"),
          NouveauSousTitre([
            "Feux de circulation temporaires ",
            mySquare(9),
            " Avec décompte de ",
            "\t\t ",
            " secondes",
          ]),
          NouvelleLigne(
            "61",
            "Installation (fig. 4.35-1 : repères visuels, distance d’éloignement p/r à la ligne de rive de 1 m au min.)"
          ),
          NouvelleLigne("62", "Hauteur d’installation"),
          NouvelleLigne("63", "Fonctionnement des unités optiques (feux)"),
          NouvelleLigne(
            "64",
            "La phase rouge adéquate (permet le dégagement de la voie de circulation sans être trop long)"
          ),
          NouvelleLigne("65", "Distance de visibilité du feu"),
          NouvelleLigne("66", "Distance entre le feu et la ligne d’arrêt"),
          NouvelleLigne("67", "Inspection de nuit (luminosité)"),
        ],
      },

      layout: my_layoutTable,
    },

    "\n",

    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------  PAGE 3  --------------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//

    {
      pageBreak: "before",
      table: {
        widths: [8, 193, 15, 15, 15, 181, 15, 35, 16, 23],

        body: [
          [
            {
              text: "Vérifications réalisées",
              alignment: "center",
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Conformité",
              alignment: "center",
              colSpan: 3,
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
            },
            {},
            {},
            {
              text: "Remarques ",
              alignment: "center",
              margin: [0, 6, 0, 0],
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              rowSpan: 2,
              border: [true, true, true, false],
            },
            {
              text: "Avis à l'entrepreneur",
              alignment: "center",
              margin: [0, -3, 0, 0],
              lineHeight: 0.8,
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
            {
              text: "Corrections",
              alignment: "center",
              style: "tableHeaderMT7",
              fillColor: "#bfbfbf",
              colSpan: 2,
            },
            {},
          ],
          [
            {
              text: "Signaleurs routiers",
              style: "tableHeaderMT8",
              fillColor: "#f2f2f2",
              lineHeight: 0.7,
              margin: [3, -2, 0, 0],
              colSpan: 2,
              border: [true, true, true, false],
            },
            {},
            {
              text: "C",
              style: "tableTxtMT7",
              alignment: "center",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "NC",
              alignment: "center",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "S.O.",
              alignment: "center",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {},
            {
              text: "Oral",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "Numéro",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "C",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
            {
              text: "NC/NR",
              style: "tableTxtMT7",
              fillColor: "#bfbfbf",
              alignment: "center",
              border: [true, true, true, false],
              lineHeight: 0.7,
            },
          ],
        ],
      },

      layout: my_layoutBanner,
    },

    {
      table: {
        widths: [9, 194, 16, 16, 16, 182, 16, 36, 17, 24],
        body: [
          NouvelleLigne("68", "Attestation de formation"),
          NouvelleLigne("69", "Équipement de protection"),
          NouvelleLigne("70", "Emplacement sécuritaire du signaleur routier"),
          NouvelleLigne("71", "Conformité des signaux transmis aux usagers"),
          NouvelleLigne(
            "72",
            "Système de communication entre signaleurs routiers"
          ),
          NouvelleLigne("73", "Utilisation du panneau ARRÊT/LENTEMENT"),
          NouvelleLigne(
            "74",
            "Barrière pour signaleur routier (fonctionnement, chaque signaleur routier est responsable d’une barrière)"
          ),
          NouvelleLigne("75", "Inspection de nuit (éclairage, visibilité)"),
          NouveauSousTitre("Véhicules"),
          NouvelleLigne(
            "76",
            "Gyrophares sur les véhicules circulant au chantier"
          ),
          NouvelleLigne(
            "77",
            "Véhicules de protection (gyrophare, flèche, lestage\nselon plan)"
          ),
          NouvelleLigne(
            "78",
            "Véhicules escorte (gyrophare, panneau « Suivez\nce véhicule »)"
          ),
          NouvelleLigne(
            "79",
            "Véhicules d'accompagnement (flèche, gyrophare,panneau\n« Congestion 500 m »)"
          ),
          NouvelleLigne(
            "80",
            "Véhicules de patrouille (gyrophare, flèche, bande jaune, inscription « Patrouille de chantier »)"
          ),
          NouveauSousTitre("Personnel de l'entrepreneur"),
          NouvelleLigne(
            "81",
            "Formation de responsable en signalisation (STC-201 et STC-102)"
          ),
          NouvelleLigne(
            "82",
            "Formation de l’équipe d’installation (ouvriers - STC-101, superviseur – STC-102)"
          ),
          NouvelleLigne("83", "Formation des patrouilleurs (STC-101)"),
          NouvelleLigne("84", "Présence au chantier (horaire exigé au devis)"),
          NouvelleLigne("85", [
            "Conformité du ",
            {
              text: "Relevé des résultats des tournées quotidiennes",
              italics: true,
            },
          ]),

          NouveauSousTitre("Chemin de détour"),
          NouvelleLigne("86", "Signalisation"),
          NouvelleLigne(
            "87",
            "État des voies de circulation et des entrées riveraines"
          ),
          NouveauSousTitre("Divers"),
          NouvelleLigne(
            "88",
            "Accès au chantier (aménagement, signalisation, sécurité)"
          ),
          NouvelleLigne(
            "89",
            "Zone de dégagement latéral, zones tampons, biseaux sont libres de tout objet non protégé (matériel, véhicule)"
          ),
          NouvelleLigne("90", "Lestage des grilles de puisards"),
          NouvelleLigne("91", "Présence du service de remorquage dédié"),
          NouvelleLigne("92", "Panneaux spéciaux (« Investissement », etc.)"),
          NouvelleLigne("93", "Panneau « Surveillance policière accrue »"),
          NouvelleLigne("94", "État des accès aux propriétés riveraines"),
          NouvelleLigne(
            "95",
            "Signaleur de chantier (formation, vêtement, équipement)"
          ),

          [
            {
              text: "96",
              alignment: "center",
              style: "tableTxtMT8",
              margin: [-1, 0, 0, 0],
              border: [true, false, true, true],
            },
            {
              text: "Présence de la SQ ",
              lineHeight: 1,
              margin: [2, 0, 0, 0],
              border: [true, false, true, true],
              style: "tableTxtN9",
            },
            {
              text: [
                mySquare(9),
                " Non\t  ",
                mySquare(9),
                " Oui\tLocalisation :",
              ],
              margin: [2, 0, 0, 0],
              border: [true, false, true, true],
              colSpan: 8,
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
          ],
        ],
      },

      layout: my_layoutTable,
    },

    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//
    //---------------------------  Fin du questionnaire  -------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//

    {
      text:
        "Légende : conforme : C, non conforme : NC, sans objet : S.O., non réalisé : NR\n\nRemarque",
      margin: [0, 4, 0, 0],
      style: "tableTxtN8",
      lineHeight: 1,
    },

    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//
    //--------------------------------  Remarques  -------------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//
    {
      table: {
        widths: [536],
        heights: [100],
        body: [[""]], //Remarque ici
      },
      layout: my_layoutRemarque,
    },

    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//
    //--------------------------------  Signatures  ------------------------------------//
    //----------------------------------------------------------------------------------//
    //----------------------------------------------------------------------------------//

    {
      margin: [0, 25, 0, 0],
      table: {
        widths: [160, 1, 78, 1, 210, 1, 74],
        body: [
          [
            { text: "", border: [false, false, false, true] }, //  Signature Responsable en signalisation
            { text: "", border: [false, false, false, false] }, // Vide
            { text: "", border: [false, false, false, true] }, //  Date
            { text: "", border: [false, false, false, false] }, // Vide
            { text: "", border: [false, false, false, true] }, //  Signature Responsable en signalisation
            { text: "", border: [false, false, false, false] }, // Vide
            { text: "", border: [false, false, false, true] }, //  Date
          ],
          [
            {
              text: "Responsable en signalisation",
              border: [false, false, false, false],
              style: "tableTxtN8",
              alignment: "center",
            },
            { text: "", border: [false, false, false, false] },
            {
              text: "Date (Année-Mois-Jour)",
              border: [false, false, false, false],
              style: "tableTxtN8",
              alignment: "center",
            },
            { text: "", border: [false, false, false, false] },
            {
              text: "Signature du surveillant",
              border: [false, false, false, false],
              style: "tableTxtN8",
              alignment: "center",
            },
            { text: "", border: [false, false, false, false] },
            {
              text: "Date (Année-Mois-Jour)",
              border: [false, false, false, false],
              style: "tableTxtN8",
              alignment: "center",
            },
          ],
        ],
      },
      layout: my_layoutBanner,
    },
  ],

  //----------------------------------------------------------------------------------//
  //----------------------------------------------------------------------------------//
  //-------------------------------  End content  ------------------------------------//
  //----------------------------------------------------------------------------------//
  //----------------------------------------------------------------------------------//

  styles: {
    header: {
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 10],

      font: "ArialNarrow",
      //font: Courier,
    },
    tableHeaderN8: {
      bold: true,
      fontSize: 8,
      color: "black",
      font: "ArialNarrow",
    },
    tableTxtN8: {
      fontSize: 8,
      color: "black",

      font: "ArialNarrow",
    },
    tableHeaderMT8: {
      bold: true,
      fontSize: 8,
      color: "black",
      font: "ArialMT",
    },
    tableTxtMT8: {
      fontSize: 8,
      color: "black",
      font: "ArialMT",
    },

    tableHeaderMT7: {
      bold: true,
      fontSize: 7,
      color: "black",

      font: "ArialMT",
    },

    tableTxtMT7: {
      fontSize: 7,
      color: "black",

      font: "ArialMT",
    },
    footTxt: {
      fontSize: 6,
      color: "black",
      font: "ArialMT",
    },
    footTxtBold: {
      fontSize: 6,
      color: "black",
      bold: true,
      font: "ArialMT",
    },
    tableTxtN9: {
      fontSize: 9,
      color: "black",

      font: "ArialNarrow",
    },

    tableExample: {
      margin: [0, 5, 0, 15],
    },

    icon: {
      font: "FontAwesome",
      fontSize: 9,
    },
  },

  defaultStyle: {
    columnGap: -15,
  },
  defaultStyle: {
    fontSize: 8,
    color: "black",
    font: "ArialMT",
    //Correspond à 'tableTxtMT8'
  },

  //----------------------------------------------------------------------------------//
  //----------------------------------------------------------------------------------//
  //-------------------------------  Bas de page  ------------------------------------//
  //----------------------------------------------------------------------------------//
  //----------------------------------------------------------------------------------//

  footer: function (currentPage, pageCount) {
    return {
      margin: [34, 0, 34, 0],

      table: {
        widths: [300, 234],
        heights: [5, 0, 5],
        body: [
          [
            {
              text: "Ministère des Transports ",
              style: "tableHeaderMT8",
              lineHeight: 0.8,
              colSpan: 2,
            },
            {},
          ],
          [
            {
              text: " ",
              fontSize: 2,
              colSpan: 2,
              fillColor: "#d9d9d9",
              lineHeight: 0.8,
            },
            {},
          ],
          [
            {
              text: [{ text: "V-3224 ", style: "footTxtBold" }, "(2019-03) "],
              style: "footTxt",
            },
            {
              text: "Page " + currentPage + " sur " + pageCount,
              style: "tableTxtMT7",
              alignment: "right",
            },
          ],
        ],
      },
      layout: "noBorders",
    };
  },
};

//----------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------//
//---------------------------------  End doc  --------------------------------------//
//----------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------//

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
