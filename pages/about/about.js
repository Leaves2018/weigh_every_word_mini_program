Page({
  onLoad: function() {
    this.setData({
      passage: `Postponed: Climate COP26 and biodiversity negotiations

The UN body that oversees international climate negotiations, the UNFCCC, has postponed until 2021 the 26th Conference of the Parties (COP26) on climate change, initially scheduled for November in Glasgow, Scotland. The summit is seen as central to advancing the climate agenda after COP25 talks in Madrid failed. The decision was taken jointly by the UNFCCC and the UK, who will now work to set a new date. Rescheduling will allow further time for the “necessary preparations” and ensure all countries “can focus on the issues to be discussed at the conference”, the UK said in a press release. “Covid-19 is the most urgent threat facing humanity today, but we cannot forget that climate change is the biggest threat facing humanity over the long term,” UNFCCC head Patricia Espinosa said. “We continue to support and to urge nations to significantly boost climate ambition in line with the Paris Agreement. ”`,
      highlight: [{
        words: ["body", "climate", "agenda", "failed", "urge"],
        style: {
          "border-bottom": "3px solid #8B4513",
        }
      }, {
        words: ["facing", "humanity", "Paris", "initially", "jointly"],
        style: {
          "background": "#7FFFAA",
        }
      }],
    })
  },
  tapWord: function(e) {},
  remarkTest: function(e) {
    this.setData({
      thisword: {
        word: "climate",
        style: {
          "background": "red",
        }
      }
    })
  }
})