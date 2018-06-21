const validateMemberType = (memberType) => {
  const memberTypeEnum = Object.freeze({
    ketua: 'ketua',
    pengurus: 'pengurus',
    anggota: 'anggota'
  })

  return Object.values(memberTypeEnum).includes(memberType)
}

export default validateMemberType