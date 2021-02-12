var fs = require("fs");
const FireBase = require("./fireBase");
var PdfPrinter = require("pdfmake/src/printer");
var path = require("path");
var phoneFormatter = require("phone-formatter");
const nodemailer = require("nodemailer");
var moment = require("moment-timezone");
moment.tz.setDefault("America/New_York");
moment.locale("fr");

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

exports.handler = async function (req, res, patrouilledata) {
  if (req) {
    var snapshotpatrouille = await FireBase.database
      .ref()
      //.child('/Patrouilles/-M0JoJTa9a1S6PpRSomx')
      .child("/Patrouilles/-M0JcF86QwS0ZyCaJPO7")
      .once("value");
    patrouilledata = snapshotpatrouille.val();
  } //pour test

  var snapshotprojet = await FireBase.database
    .ref()
    .child("/Projects/" + patrouilledata.project)
    .once("value");

  var projetdata = snapshotprojet.val();

  console.log(patrouilledata);
  console.log(projetdata);

  var docDefinition = buildDocDefinition(patrouilledata, projetdata);

  var pdf = await generatePDF(docDefinition);
  await saveFileInBucket(patrouilledata, pdf);
  //console.log();
  // if (projetdata.sendemailformulairepatrouille) {
  var fileName = getFileName(projetdata, patrouilledata);
  await sendMail(pdf, fileName, patrouilledata, projetdata);
  //}

  if (req) {
    //pour test
    res.contentType("application/pdf");
    res.send(pdf);
  }
};

function buildDocDefinition(patrouilledata, projetdata) {
  var docDefinition = {
    content: [],
    ...getcustomstyles(),
    ...getdefaultstyle(),
  };
  docDefinition.content.push(header(projetdata.projectnumber));
  docDefinition.content.push(
    description_project(
      patrouilledata.data["B-choice"][0],
      projetdata.projectnumbervdm,
      moment(patrouilledata.data.date).format("HH[h]mm"),
      projetdata.projecttitle,
      patrouilledata.creepar,
      moment(patrouilledata.data.date).format("YYYY-MM-DD")
    )
  );
  docDefinition.content.push(typedetravaux(patrouilledata.data["C-choice"]));
  docDefinition.content.push(
    PMV(patrouilledata.data["2-conform"], patrouilledata.data["3-conform"])
  );
  docDefinition.content.push(
    panneaux(
      patrouilledata.data["5-conform"],
      patrouilledata.data["6-conform"],
      patrouilledata.data["7-conform"],
      patrouilledata.data["7-choice"][0],
      patrouilledata.data["8-conform"],
      patrouilledata.data["9-conform"],
      patrouilledata.data["10-conform"],
      patrouilledata.data["11-conform"],
      patrouilledata.data["12-conform"],
      patrouilledata.data["13-conform"],
      patrouilledata.data["14-conform"],
      patrouilledata.data["15-conform"]
    )
  );
  docDefinition.content.push(
    signalisationetreperes(
      patrouilledata.data["16-conform"],
      patrouilledata.data["17-conform"],
      patrouilledata.data["18-conform"],
      patrouilledata.data["19-conform"]
    )
  );
  docDefinition.content.push(
    signalisationentrave(
      patrouilledata.data["20-conform"],
      patrouilledata.data["21-conform"],
      patrouilledata.data["21-choice"],
      patrouilledata.data["22-conform"],
      patrouilledata.data["23-conform"],
      patrouilledata.data["24-conform"],
      patrouilledata.data["25-conform"],
      patrouilledata.data["26-conform"],
      patrouilledata.data["27-conform"],
      patrouilledata.data["28-conform"],
      patrouilledata.data["29-conform"],
      patrouilledata.data["30-conform"]
    )
  );
  docDefinition.content.push(
    feuxcirculation(
      patrouilledata.data["31-conform"],
      patrouilledata.data["32-conform"],
      patrouilledata.data["33-conform"],
      patrouilledata.data["34-conform"]
    )
  );
  docDefinition.content.push(
    reperesvisuels(
      patrouilledata.data["35-conform"],
      patrouilledata.data["36-conform"],
      patrouilledata.data["37-conform"],
      patrouilledata.data["38-conform"],
      patrouilledata.data["39-conform"]
    )
  );
  docDefinition.content.push(
    marquage(
      patrouilledata.data["40-conform"],
      patrouilledata.data["41-conform"],
      patrouilledata.data["42-conform"]
    )
  );
  docDefinition.content.push(
    signaleur(
      patrouilledata.data["43-conform"],
      patrouilledata.data["44-conform"],
      patrouilledata.data["45-conform"],
      patrouilledata.data["46-conform"],
      patrouilledata.data["47-conform"],
      patrouilledata.data["48-conform"],
      patrouilledata.data["49-conform"]
    )
  );
  docDefinition.content.push(
    divers(
      patrouilledata.data["50-conform"],
      patrouilledata.data["51-conform"],
      patrouilledata.data["52-conform"],
      patrouilledata.data["53-conform"],
      patrouilledata.data["54-conform"],
      patrouilledata.data["55-conform"],
      patrouilledata.data["56-conform"],
      patrouilledata.data["57-conform"]
    )
  );
  //docDefinition.content.push(...renderfooter(data.comments, data.savingpath));
  docDefinition.content.push(
    ...renderfooter(patrouilledata.data["commentaires"])
  );
  return docDefinition;
}
async function saveFileInBucket(patrouilledata, pdf) {
  var file = FireBase.bucket.file(
    patrouilledata.project + "/Formulaire patrouille/test.pdf"
  );
  var url = await getFileUrl(file);
  await file.save(pdf, {
    metadata: {
      contentType: "application/pdf",
    },
  });
  console.log(url);
}
function getFileUrl(file) {
  return new Promise((resolve) => {
    const options = {
      action: "read",
      expires: "03-17-2500",
    };
    file.getSignedUrl(options, (err, url) => {
      if (err) {
        console.error(err);
        return;
      }
      resolve(url);
    });
  });
}
function generatePDF(docDefinition) {
  var printer = new PdfPrinter(fonts);
  const doc = printer.createPdfKitDocument(docDefinition);

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
function getFileName(projectdata, patrouilledata) {
  var fileName =
    patrouilledata.project +
    "-PAT-(" +
    moment(patrouilledata.data.date).format("YYYY-MM-DD HH[h]mm") +
    ")-Rapport patrouille-" +
    patrouilledata.creepar.toString().split(" ")[0].charAt(0).toUpperCase() +
    patrouilledata.creepar.toString().split(" ")[1].charAt(0).toUpperCase();
  return fileName;
}
async function sendMail(pdf, fileName, data, project) {
  var shift = data.data["A-choice"][0] === 1 ? "Jour" : "Nuit";
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    post: 587,
    auth: {
      user: "circulation@bauval.com",
      pass: "pXp9R2vH5Pj",
    },
  });
  var toformulairepatrouille = "";
  project.toformulairepatrouille.forEach((item) => {
    toformulairepatrouille += item + ";";
  });
  var ccformulairepatrouille = "";
  project.ccformulairepatrouille.forEach((item) => {
    ccformulairepatrouille += item + ";";
  });
  let mailOptions = {
    from: "Circulation Construction Bau-Val <circulation@bauval.com>",
    to: toformulairepatrouille,
    cc: ccformulairepatrouille,
    subject:
      project.projectnumbervdm +
      "-" +
      data.project +
      "-" +
      project.projecttitle +
      ", Rapport de patrouille (" +
      moment(data.data.date).format("YYYY-MM-DD HH[h]mm") +
      ")",
    html:
      "<p style='font-family:Calibri;font-size:15px;'>Bonjour,</p><p style='font-family:Calibri;font-size:15px;'>Veuillez trouver ci-joint le rapport d'inspection de la signalisation suivant : <br /><b>Projet Ville de Montréal : </b>" +
      project.projectnumbervdm +
      "<br/><b>Projet Construction Bau-Val : </b>" +
      data.project +
      "<br /><b>Titre du projet : </b>" +
      project.projecttitle +
      "<br /><b>Date : </b>" +
      moment(data.data.date).format("YYYY-MM-DD HH[h]mm") +
      "<br /><b>Quart de travail : </b>" +
      shift +
      "<br /><b>Réalisé par : </b>" +
      data.creepar +
      "<br /><b>Commentaires : </b>" +
      data.data.commentaires +
      "<br /><br />Si vous avez besoin de renseignements supplémentaires, veuillez contacter le coordonnateur en circulation : <br /><b>" +
      project.coordonnateur_firstname +
      " " +
      project.coordonnateur_lastname +
      "<br />" +
      phoneFormatter.format(project.coordonnateur_telephone, "(NNN) NNN-NNNN") +
      "<br />" +
      project.coordonnateur_email +
      "</b>" +
      '</p><div style="font-family:Arial;font-size:15px;color:#af292e">Département mobilité et circulation</div><br /><img src="cid:unique@nodemailer.com" width="190"/><br /><br /><div style="font-family:Arial;font-size:11px;color:#323e48">87 Émilien-Marcoux, bureau 101<br />Blainville, QC, J7C 0B4</div><div style="font-family:Arial;font-size:11px;"><span style="color:#af292e">T: </span><span style="color:#323e48">514-788-4660</span></div><div style="font-family:Arial;font-size:11px;color:#323e48">circulation@bauval.com</div><div style="font-family:Arial;font-size:11px;color:#af292e">www.constructionbauval.com</div>',
    attachments: [
      { filename: fileName + ".pdf", content: pdf },
      {
        filename: "constructionbauval.png",
        path: path.join(__dirname, "images", "constructionbauval.png"),
        cid: "unique@nodemailer.com", //same cid value as in the html img src
      },
    ],
  };
  let info = await transporter.sendMail(mailOptions);
  return console.log("Message sent: %s", info.messageId);
}
function header(projectnumber) {
  var header = {
    columns: [
      { text: " ", width: "20%" },
      {
        width: "auto",
        stack: [
          {
            ...getbauvallogo(),
          },
        ],
      },
      {
        layout: "noBorders",
        table: {
          widths: [100, "auto"],
          body: [
            [
              {
                text: "Rapport d'inspection de la signalisation",
                colSpan: 2,
                bold: true,
                fontSize: 10,
              },
              {},
            ],
            [
              "# Projet interne",
              { text: projectnumber, bold: true, color: "#af292e" },
            ],
          ],
        },
      },
    ],
    columnGap: 50,
  };
  return header;
}
function description_project(
  bchoice,
  projectnumbervdm,
  heure,
  localisation,
  preparepar,
  datepreparepar
) {
  var _inspect_prel =
    bchoice === 1
      ? { text: "", style: "icon", color: "#af292e" }
      : { text: "", style: "icon" };
  var _inspec_quot =
    bchoice === 2
      ? { text: "", style: "icon", color: "#af292e" }
      : { text: "", style: "icon" };
  var _projectnumbervdm = { text: projectnumbervdm, style: "databold" };
  var _heure = { text: heure, style: "databold" };
  var _localisation = { text: localisation, style: "databold" };
  var _preparepar = { text: preparepar, style: "databold" };
  var _datepreparepar = { text: datepreparepar, style: "databold" };

  var description = {
    style: "tablestyle",
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: [
              "Type :                      Inspection préliminaire, de démarrage   ",
              _inspect_prel,
              "                               Inspection quotidienne   ",
              _inspec_quot,
            ],
          },
        ],
        [
          {
            text: [
              "Contrat n° : ",
              _projectnumbervdm,
              "                        Structure n° :                            Heure : ",
              _heure,
            ],
          },
        ],
        [
          {
            text: [
              "Entrepreneur : ",
              { text: "Roxboro Excavation Inc.", style: "databold" },
            ],
          },
        ],
        [
          {
            text: "Directeur ou son \nreprésentant : ",
          },
        ],
        [
          {
            text: ["Localisation : ", _localisation],
          },
        ],
        [
          {
            text: [
              "Préparé par : ",
              _preparepar,
              "                                                 Date : ",
              _datepreparepar,
            ],
          },
        ],
      ],
    },
  };
  return description;
}
function typedetravaux(cchoice) {
  var _demarrageinitial = cchoice.includes(1)
    ? { text: "", style: "icon", color: "#af292e" }
    : { text: "", style: "icon" };
  var _courteduree = cchoice.includes(3)
    ? { text: "", style: "icon", color: "#af292e" }
    : { text: "", style: "icon" };
  var _changementdephase = cchoice.includes(2)
    ? { text: "", style: "icon", color: "#af292e" }
    : { text: "", style: "icon" };
  var _longueduree = cchoice.includes(4)
    ? { text: "", style: "icon", color: "#af292e" }
    : { text: "", style: "icon" };
  var typedetravaux = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", "*"],
      body: [
        [
          {
            text: "Type de travaux",
            colSpan: 3,
            bold: true,
          },
          {},
          {},
        ],
        [
          {
            text: "1",
            alignment: "center",
            bold: true,
            rowSpan: 2,
          },
          { text: [_demarrageinitial, "   Démarrage initial"] },
          { text: [_courteduree, "   Courte durée < 24 heures"] },
        ],
        [
          {},
          { text: [_changementdephase, "   Changement de phase"] },
          { text: [_longueduree, "   Longue durée > 24 heures"] },
        ],
      ],
    },
  };
  return typedetravaux;
}
function PMV(question2, question3) {
  var PMV = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("PMV")],
        [
          ...renderquestion(
            "2",
            "Emplacement des panneaux à messages variables (visibilité > 300m)",
            question2
          ),
        ],
        [
          ...renderquestion(
            "3",
            "Affichage adéquat des messages en fonction de l'évolution des travaux et des incidents",
            question3
          ),
        ],
      ],
    },
  };
  return PMV;
}
function panneaux(
  question5,
  question6,
  question7,
  dimensions,
  question8,
  question9,
  question10,
  question11,
  question12,
  question13,
  question14,
  question15
) {
  var panneaux = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Panneaux")],
        [
          ...renderquestion(
            "5",
            "Type de pellicule sur panneaux (Type III : Blanc / Orange)",
            question5
          ),
        ],
        [
          ...renderquestion(
            "6",
            "Type de pellicule sur panneaux (Type VII : Orange fluo)",
            question6
          ),
        ],
        [
          ...renderquestionwithchoices(
            "7",
            "Dimensions des panneaux en mm (tableau 1.9-1)",
            question7,
            ["300", "450", "600", "750", "900", "1200", "2400"],
            dimensions
          ),
        ],
        [
          ...renderquestion(
            "8",
            "Apparence des panneaux et des pictogrammes",
            question8
          ),
        ],
        [
          ...renderquestion(
            "9",
            "Hauteur d'installation p/r à la ligne de rive",
            question9
          ),
        ],
        [
          ...renderquestion(
            "10",
            "Distance d'éloignement p/r à la ligne de rive 0 à < 3,5 m",
            question10
          ),
        ],
        [...renderquestion("11", "Panneaux d'aluminium", question11)],
        [...renderquestion("12", "Rétroréflection conforme > 50%", question12)],
        [...renderquestion("13", "Masquage des panneaux", question13)],
        [
          ...renderquestion(
            "14",
            "Propreté des panneaux et des repères",
            question14
          ),
        ],
        [
          ...renderquestion(
            "15",
            'Panneau "Congestion XXX m" disponible au chantier',
            question15
          ),
        ],
      ],
    },
  };
  return panneaux;
}
function signalisationetreperes(
  question16,
  question17,
  question18,
  question19
) {
  var signalisationetreperes = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [
          ...rendertitletable(
            "Mise en place de la signalisation et des repères"
          ),
        ],
        [
          ...renderquestion(
            "16",
            "Utilisation d'atténuateurs d'impact pour la mise en place et le démentèlement de la signalisation lorsque requis",
            question16
          ),
        ],
        [
          ...renderquestion(
            "17",
            "Masquage des panneaux hors fonction",
            question17
          ),
        ],
        [...renderquestion("18", "Gyrophares des camions", question18)],
        [
          ...renderquestion(
            "19",
            "Flèches de signalisation sur camions",
            question19
          ),
        ],
      ],
    },
  };
  return signalisationetreperes;
}
function signalisationentrave(
  question20,
  question21,
  vitesse,
  question22,
  question23,
  question24,
  question25,
  question26,
  question27,
  question28,
  question29,
  question30
) {
  var signalisationentrave = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Mise en place de la signalisation d'entrave")],
        [
          ...renderquestion(
            "20",
            "Validation selon les plans ou les dessins",
            question20
          ),
        ],
        [
          ...renderquestionwithchoices(
            "21",
            "Vitesse temporaire affichée :",
            question21,
            ["30 km/h", "40 km/h"],
            vitesse
          ),
        ],
        [
          ...renderquestion(
            "22",
            "Localisation des panneaux de vitesse",
            question22
          ),
        ],
        [...renderquestion("23", "Longueur de biseau", question23)],
        [...renderquestion("24", "Espacement des repères visuels", question24)],
        [...renderquestion("25", "Espacement des panneaux", question25)],
        [
          ...renderquestion(
            "26",
            "Largeur des voies de circulation",
            question26
          ),
        ],
        [...renderquestion("27", "Panneau fin affiché", question27)],
        [
          ...renderquestion(
            "28",
            "Dispositifs de retenue frontaux",
            question28
          ),
        ],
        [
          ...renderquestion(
            "29",
            "Dispositifs de retenue latéraux",
            question29
          ),
        ],
        [...renderquestion("30", "Itinéraire facultatif vérifié", question30)],
      ],
    },
  };

  return signalisationentrave;
}
function feuxcirculation(question31, question32, question33, question34) {
  var feuxcirculation = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Feux de circulation")],
        [
          ...renderquestion(
            "31",
            "La phase rouge permet le dégagement de la voie de circulation",
            question31
          ),
        ],
        [
          ...renderquestion(
            "32",
            "Hauteur entre la chaussée et le dessous du feu",
            question32
          ),
        ],
        [...renderquestion("33", "Visibilité", question33)],
        [
          ...renderquestion(
            "34",
            "Fonctionnement des unités optiques (feux)",
            question34
          ),
        ],
      ],
    },
  };

  return feuxcirculation;
}
function reperesvisuels(
  question35 = "na",
  question36 = "na",
  question37 = "na",
  question38 = "na",
  question39 = "na"
) {
  var reperesvisuels = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Repères visuels")],
        [
          ...renderquestion(
            "35",
            "Alignement des repères visuels / dans la zone de travail",
            question35
          ),
        ],
        [
          ...renderquestion(
            "36",
            "Stabilité des repères / dans la zone de travail",
            question36
          ),
        ],
        [
          ...renderquestion(
            "37",
            "Flèches de signalisation de chantier / Distance de visibilité > 600 m",
            question37
          ),
        ],
        [
          ...renderquestion(
            "38",
            "Flèches de signalisation de chantier / Dimensions",
            question38
          ),
        ],
        [
          ...renderquestion(
            "39",
            "Flèches de signalisation de chantier / Fonctionnement des blocs optiques",
            question39
          ),
        ],
      ],
    },
  };

  return reperesvisuels;
}
function marquage(question40, question41, question42) {
  var marquage = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Marquage temporaire de la chaussée")],
        [...renderquestion("40", "Marquage", question40)],
        [...renderquestion("41", "Effaçage", question41)],
        [...renderquestion("42", "Délinéateurs de surface", question42)],
      ],
    },
  };

  return marquage;
}
function signaleur(
  question43,
  question44,
  question45,
  question46,
  question47,
  question48,
  question49
) {
  var signaleur = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Signaleur")],
        [...renderquestion("43", "Équipement de protection", question43)],
        [
          ...renderquestion(
            "44",
            "Emplacement sécuritaire du signaleur",
            question44
          ),
        ],
        [
          ...renderquestion(
            "45",
            "Conformité des signaux transmis aux usagers",
            question45
          ),
        ],
        [
          ...renderquestion(
            "46",
            "Système de communication entre signaleurs",
            question46
          ),
        ],
        [...renderquestion("47", "Éclairage (si requis)", question47)],
        [
          ...renderquestion(
            "48",
            "Utilisation du panneau ARRÊT/LENTEMENT",
            question48
          ),
        ],
        [...renderquestion("49", "Attestation de formation", question49)],
      ],
    },
  };

  return signaleur;
}
function divers(
  question50,
  question51,
  question52,
  question53,
  question54,
  question55,
  question56,
  question57
) {
  var divers = {
    style: "tablestyle",
    table: {
      headerRows: 1,
      widths: [20, "*", 20, 20, 20],
      body: [
        [...rendertitletable("Divers")],
        [...renderquestion("50", "Équipement de protection", question50)],
        [
          ...renderquestion(
            "51",
            "Attestation de formation - Personnel de chantier (patrouilleur)",
            question51
          ),
        ],
        [
          ...renderquestion(
            "52",
            "Attestation de formation des équipes d'installation de signalisation (STC-101)",
            question52
          ),
        ],
        [
          ...renderquestion(
            "53",
            "Attestation de formation - Responsable en signalisation (STC-102)",
            question53
          ),
        ],
        [...renderquestion("54", "Chantier ciblé", question54)],
        [...renderquestion("55", "Présence du SPVM", question55)],
        [
          ...renderquestion(
            "56",
            'Présence du panneau policier "surveillance policière accrue"',
            question56
          ),
        ],
        [
          ...renderquestion(
            "57",
            'Présence du panneau "Investissement"',
            question57
          ),
        ],
      ],
    },
  };

  return divers;
}
function renderfooter(comments, savingpath = "") {
  var _comments = { text: comments, style: "databold" };
  var footer = [
    {
      style: "tablestyle",
      table: {
        headerRows: 1,
        widths: ["*", "*"],
        heights: [60, 50],
        body: [
          [
            {
              colSpan: 2,
              text: [{ text: "Commentaires :\n", bold: true }, _comments],
            },
            {},
          ],
          [
            { text: "Directeur ou son représentant :", bold: true },
            { text: "Date :", bold: true },
          ],
        ],
      },
    },
    { text: "\nSauvegardé à : " + decodeURI(savingpath), alignment: "right" },
  ];
  return footer;
}
function rendertitletable(title) {
  var _title = [
    {
      text: title,
      colSpan: 2,
      bold: true,
    },
    {},
    { text: "c", alignment: "center", bold: true },
    { text: "nc", alignment: "center", bold: true },
    { text: "na", alignment: "center", bold: true },
  ];
  return _title;
}
function renderquestion(questionnumber, description, answer) {
  var _question = [
    { text: questionnumber, alignment: "center", bold: true },
    {
      text: description,
    },
    ...renderconformite(answer),
  ];
  return _question;
}
function renderquestionwithchoices(
  questionnumber,
  description,
  answer,
  choices,
  validchoice
) {
  var _choices = [];
  choices.forEach((item) => {
    if (item === choices[validchoice - 1]) {
      _choices.push({
        text: [
          { text: "", style: "icon", color: "#af292e" },
          " " + item + "   ",
        ],
      });
    } else {
      _choices.push({
        text: [{ text: "", style: "icon" }, " " + item + "   "],
      });
    }
  });

  var _question = [
    { text: questionnumber, alignment: "center", bold: true },
    {
      text: [description + "\n", ..._choices],
    },
    ...renderconformite(answer),
  ];
  return _question;
}
function renderconformite(value) {
  switch (value) {
    case "c":
      var _value = [
        { text: "", style: "icon", alignment: "center", color: "#af292e" },
        { text: "", style: "icon", alignment: "center" },
        { text: "", style: "icon", alignment: "center" },
      ];
      return _value;
    case "nc":
      var _value = [
        { text: "", style: "icon", alignment: "center" },
        { text: "", style: "icon", alignment: "center", color: "#af292e" },
        { text: "", style: "icon", alignment: "center" },
      ];
      return _value;
    case "na":
      var _value = [
        { text: "", style: "icon", alignment: "center" },
        { text: "", style: "icon", alignment: "center" },
        { text: "", style: "icon", alignment: "center", color: "#af292e" },
      ];
      return _value;
  }
}
function getcustomstyles() {
  var styles = {
    styles: {
      tablestyle: {
        margin: [0, 10, 0, 0],
      },
      icon: {
        font: "FontAwesome",
      },
      databold: {
        bold: true,
        fontSize: 10,
        color: "#af292e",
      },
    },
  };
  return styles;
}
function getdefaultstyle() {
  var styles = {
    defaultStyle: {
      fontSize: 9,
    },
  };
  return styles;
}
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer.from(bitmap).toString("base64");
}
function getbauvallogo() {
  var base64toreturn = {
    image:
      "data:image/jpeg;base64," +
      base64_encode(path.join(__dirname, "images", "logosignatool.png")),
    width: 150,
  };
  return base64toreturn;
}
