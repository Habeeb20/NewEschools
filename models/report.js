// import mongoose from "mongoose"

// const reportSchema  = new mongoose.Schema({
//     nameOfReporter:{
//         type:String,
//         required: true,
//         trim: true
//     },
//     emailOfReporter : {
//         type:String,
//         required: true,
//         validate:{
//             validator:function(v) {
//                 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//             },
//             message:props => `${props.value} is not a valid email!`
//         }
//     },
//     phonenum: {
//         type: String, 
//         required: true,
//         trim: true
//     },
//     school: {
//         type: String,
//         required: true
//     },
//     emailOfReported: {
//         type: String,
//         required: true,
//         validate: {
//             validator: function (v) {
//                 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); 
//             },
//             message: props => `${props.value} is not a valid email!`
//         }
//     },
//     offense: {
//         type: String,
//         required: true
//     }

// },  { timestamps: true })

// export default mongoose.model("Report", reportSchema);


import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        nameOfReporter: {
            type: String,
            required: true,
            trim: true,
        },
        emailOfReporter: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        phonenum: {
            type: String,
            required: true,
            trim: true,
        },
        school: {
            type: String,
            required: true,
        },
        emailOfReported: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        offense: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Use an existing model if it exists, or create a new one
export default mongoose.models.Report || mongoose.model("Report", reportSchema);
