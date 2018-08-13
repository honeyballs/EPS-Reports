function createBarChart(labels, datasets) {
   console.log(labels);
   console.log(datasets);
   let ctx = $( "#bar-chart" )[0].getContext('2d');
   let myChart = new Chart(ctx, {
      type: 'bar',
      data: {
         labels: labels,
         datasets: datasets
      },
      options: {
         scales: {
             yAxes: [{
                 ticks: {
                     beginAtZero:true
                 }
             }]
         }
     }
   })
}