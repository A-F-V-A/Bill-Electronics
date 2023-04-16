const bcrypt =require( "bcryptjs");
const mongoose =require( "mongoose");


const productSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    p12File: {
      type: Buffer, // o type: String si prefieres almacenar la ruta del archivo en vez del archivo mismo
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//productSchema.statics.encryptPassword = async (password) => {
  //const salt = await bcrypt.genSalt(10);
  //return await bcrypt.hash(password, salt);
//};

/*productSchema.statics.comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword)
}*/
productSchema.statics.comparePassword = (password, receivedPassword) => {
  return password === receivedPassword;
}


productSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  //const hash = await bcrypt.hash(user.password, 10);
  //user.password = hash;
  // si hay un archivo .p12 en la petición, procesarlo
  if (user.p12File && user.p12File instanceof Buffer) {
    // guardar el archivo en la base de datos
    user.p12File = await guardarArchivo(user.p12File);
  }

  next();
})

module.exports =  mongoose.model("User", productSchema);
